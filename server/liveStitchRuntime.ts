import type { Express } from "express";
import type { Server as HttpServer } from "http";
import { WebSocketServer } from "ws";
import crypto from "crypto";
import { buildSystemReport } from "./systemReporter";
import { runIntegrityCycle } from "./stitchIntegrityKernel";
import { runSecurityReverificationCycle } from "./securityVerificationMembrane";
import { runUntilFivePassedCycles } from "./fiveCycleVerifier";
import { appendSecurityEvent } from "./stitchSecurity";
import { exportVaultSnapshot, appendVaultRecord } from "./sovereignVault";

export type SandboxDecision = { allowed: boolean; reason: string; mode: "allow" | "block" | "owner_review" };
export type MeshPeer = { id: string; name: string; address: string; pairedAt: string; trust: "unverified" | "paired" | "trusted" };
export type LocalAiRequest = { prompt: string; model?: string; mode?: "local" | "human_review" };

const peers = new Map<string, MeshPeer>();
let daemonTimer: NodeJS.Timeout | null = null;

function id(prefix: string) {
  return `${prefix}-${crypto.randomBytes(8).toString("hex")}`;
}

export function evaluateSandbox(action: string): SandboxDecision {
  if (/rm\s+-rf|format|shutdown|delete\s+vault|exfiltrate|dump\s+secret|private\s+key|seed\s+phrase/i.test(action)) {
    return { allowed: false, reason: "dangerous_action_blocked_by_sandbox", mode: "block" };
  }
  if (/network|shell|filesystem|write|delete|modify|deploy/i.test(action)) {
    return { allowed: false, reason: "elevated_action_requires_owner_review", mode: "owner_review" };
  }
  return { allowed: true, reason: "sandbox_safe_action", mode: "allow" };
}

export async function runLocalAi(request: LocalAiRequest) {
  const endpoint = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
  const model = request.model ?? process.env.STITCH_LOCAL_MODEL ?? "llama3.2";

  if (request.mode === "human_review") {
    return { ok: true, mode: "human_review", output: "Local AI bypassed. Human review required.", model };
  }

  try {
    const response = await fetch(`${endpoint}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: request.prompt, stream: false }),
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json() as { response?: string };
    return { ok: true, mode: "local", model, output: data.response ?? "" };
  } catch (error) {
    return { ok: false, mode: "fallback", model, output: "Local AI unavailable. Route to human review.", error: error instanceof Error ? error.message : "unknown" };
  }
}

export function pairMeshPeer(input: { name: string; address: string; code?: string }) {
  const peer: MeshPeer = { id: id("peer"), name: input.name, address: input.address, pairedAt: new Date().toISOString(), trust: input.code === "1211" ? "paired" : "unverified" };
  peers.set(peer.id, peer);
  appendSecurityEvent({ severity: peer.trust === "paired" ? "info" : "warn", event: "MESH_PEER_PAIRED", actor: "device-mesh", details: peer });
  return peer;
}

export function listMeshPeers() {
  return Array.from(peers.values());
}

export function buildMemoryCard() {
  const snapshot = exportVaultSnapshot();
  return { id: id("memory-card"), at: new Date().toISOString(), checksum: snapshot.checksum, memoryCount: snapshot.memory.length, quarantineCount: snapshot.quarantine.length };
}

export function importMemoryCard(card: { id: string; checksum: string; note?: string }) {
  return appendVaultRecord({ title: `Imported memory card ${card.id}`, content: JSON.stringify({ checksum: card.checksum, note: card.note ?? "" }), source: "memory_card", tags: ["mesh", "memory-card", "quarantine-review"] });
}

export function startStitchDaemon(intervalMs = Number(process.env.STITCH_DAEMON_INTERVAL_MS ?? 180000)) {
  if (daemonTimer) return { ok: true, status: "already_running", intervalMs };
  daemonTimer = setInterval(() => {
    const report = buildSystemReport();
    const integrity = runIntegrityCycle();
    const membrane = runSecurityReverificationCycle();
    appendSecurityEvent({ severity: report.status === "green" && integrity.level === "green" && membrane.status === "green" ? "info" : "warn", event: "DAEMON_TICK", actor: "stitchd", details: { report: report.status, integrity: integrity.level, membrane: membrane.status } });
  }, intervalMs);
  return { ok: true, status: "started", intervalMs };
}

export function stopStitchDaemon() {
  if (daemonTimer) clearInterval(daemonTimer);
  daemonTimer = null;
  return { ok: true, status: "stopped" };
}

export function installLiveStitchRuntime(app: Express, server: HttpServer) {
  const wss = new WebSocketServer({ server, path: "/api/stitch/live" });

  const broadcast = (payload: unknown) => {
    const data = JSON.stringify({ at: new Date().toISOString(), ...payload });
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) client.send(data);
    }
  };

  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ at: new Date().toISOString(), type: "runtime_pulse", status: "connected" }));
    socket.send(JSON.stringify({ at: new Date().toISOString(), type: "system_report", payload: buildSystemReport() }));
    socket.send(JSON.stringify({ at: new Date().toISOString(), type: "vault_status", payload: exportVaultSnapshot() }));
  });

  setInterval(() => broadcast({ type: "runtime_pulse", payload: buildSystemReport() }), 30000);

  app.get("/api/stitch/live/snapshot", (_req, res) => res.json({ report: buildSystemReport(), integrity: runIntegrityCycle(), membrane: runSecurityReverificationCycle(), vault: exportVaultSnapshot(), peers: listMeshPeers() }));
  app.post("/api/stitch/daemon/start", (_req, res) => res.json(startStitchDaemon()));
  app.post("/api/stitch/daemon/stop", (_req, res) => res.json(stopStitchDaemon()));
  app.post("/api/stitch/local-ai", async (req, res) => res.json(await runLocalAi(req.body ?? {})));
  app.post("/api/stitch/mesh/pair", (req, res) => res.json(pairMeshPeer(req.body ?? {})));
  app.get("/api/stitch/mesh/peers", (_req, res) => res.json({ peers: listMeshPeers() }));
  app.get("/api/stitch/memory-card", (_req, res) => res.json(buildMemoryCard()));
  app.post("/api/stitch/memory-card/import", (req, res) => res.json(importMemoryCard(req.body ?? {})));
  app.post("/api/stitch/sandbox/evaluate", (req, res) => res.json(evaluateSandbox(String(req.body?.action ?? ""))));
  app.post("/api/stitch/cycles/five", (_req, res) => res.json(runUntilFivePassedCycles()));

  startStitchDaemon();
  return { wss };
}
