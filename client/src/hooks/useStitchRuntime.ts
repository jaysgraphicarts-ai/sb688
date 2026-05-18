import { useCallback, useEffect, useMemo, useState } from "react";
import { stitchApi, type SovereignAdapter, type StitchBootStatus, type StitchClipBrick } from "../lib/stitchApi";

export type RuntimePulse = "booting" | "green" | "yellow" | "red";

export function useStitchRuntime() {
  const [boot, setBoot] = useState<StitchBootStatus | null>(null);
  const [clipBricks, setClipBricks] = useState<StitchClipBrick[]>([]);
  const [adapters, setAdapters] = useState<SovereignAdapter[]>([]);
  const [runnableAdapters, setRunnableAdapters] = useState<SovereignAdapter[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<string | null>(null);
  const [connection, setConnection] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [bootStatus, bricks, adapterState] = await Promise.all([
        stitchApi.boot(),
        stitchApi.clipBricks(),
        stitchApi.adapters().catch(() => ({ adapters: [], runnable: [] })),
      ]);
      setBoot(bootStatus);
      setClipBricks(bricks.bricks);
      setAdapters(adapterState.adapters);
      setRunnableAdapters(adapterState.runnable);
      setAlerts((current) => bootStatus.ok ? current.filter((item) => !item.includes("boot")) : ["Sovereign boot check needs attention", ...current]);
    } catch (error) {
      setAlerts((current) => [`Runtime refresh failed: ${error instanceof Error ? error.message : "unknown"}`, ...current].slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const connect = useCallback(async (prompt: string, handshakeCode: string) => {
    const result = await stitchApi.connect(prompt, handshakeCode) as any;
    setConnection(result);
    if (result?.expiresAt) setSessionExpiresAt(result.expiresAt);
    return result;
  }, []);

  const disconnect = useCallback(() => {
    setConnection(null);
    setSessionExpiresAt(null);
    setAlerts((current) => ["Session disconnected locally", ...current].slice(0, 8));
  }, []);

  const renew = useCallback(() => {
    const next = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    setSessionExpiresAt(next);
    setAlerts((current) => ["Session renewed locally for 60 minutes", ...current].slice(0, 8));
  }, []);

  const pulse: RuntimePulse = useMemo(() => {
    if (loading) return "booting";
    if (!boot) return "red";
    if (!boot.ok) return "yellow";
    if (alerts.some((alert) => /failed|denied|attention/i.test(alert))) return "yellow";
    return "green";
  }, [alerts, boot, loading]);

  return { boot, clipBricks, adapters, runnableAdapters, alerts, pulse, loading, connection, sessionExpiresAt, refresh, connect, disconnect, renew };
}
