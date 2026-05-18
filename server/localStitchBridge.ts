import type { Express } from "express";
import crypto from "crypto";

export type LocalBridgeScope = "request_only" | "doctrine_read" | "work_room" | "owner_review" | "blocked";

export type LocalBridgeSession = {
  bridgeId: string;
  at: string;
  sourceAi: string;
  purpose: string;
  scope: LocalBridgeScope;
  localOnly: true;
  expiresAt: string;
  ledgerHash: string;
};

const sessions = new Map<string, LocalBridgeSession>();

function sha256(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function classifyScope(input: { sourceAi?: string; purpose?: string; requestedScope?: string }): LocalBridgeScope {
  const text = `${input.sourceAi ?? ""} ${input.purpose ?? ""} ${input.requestedScope ?? ""}`.toLowerCase();

  if (/secret|token|passcode|private key|spine|override|bypass|cross-tenant|disable ledger|disable logs/.test(text)) {
    return "blocked";
  }

  if (/publish|send|deploy|merge|owner|approve|emergency|cutoff/.test(text)) {
    return "owner_review";
  }

  if (/work room|file|image|picture|advertisement|ad|prompt|campaign|brick|test|web/.test(text)) {
    return "work_room";
  }

  if (/doctrine|read|status|summary|explain/.test(text)) {
    return "doctrine_read";
  }

  return "request_only";
}

function createLocalSession(input: { sourceAi?: string; purpose?: string; requestedScope?: string }): LocalBridgeSession {
  const draft = {
    bridgeId: `local-bridge-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    at: new Date().toISOString(),
    sourceAi: input.sourceAi ?? "unknown_local_ai",
    purpose: input.purpose ?? "unspecified",
    scope: classifyScope(input),
    localOnly: true as const,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };

  const session: LocalBridgeSession = { ...draft, ledgerHash: sha256(draft) };
  sessions.set(session.bridgeId, session);
  return session;
}

function isLocalRequest(req: any) {
  const ip = req.ip || req.socket?.remoteAddress || "";
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.includes("localhost");
}

export function installLocalStitchBridge(app: Express) {
  app.post("/api/stitch/local-bridge/connect", (req, res) => {
    if (!isLocalRequest(req)) {
      return res.status(403).json({ ok: false, error: "local_bridge_rejects_remote_requests" });
    }

    const session = createLocalSession(req.body ?? {});

    return res.json({
      ok: session.scope !== "blocked",
      session,
      laws: [
        "Local bridge only.",
        "Nothing touches the Spine.",
        "AI access is scoped and proposal-only until verified.",
        "Unverifiable outside noise is silenced.",
        "Owner approval is required for publish, send, deploy, merge, emergency, or Spine-level changes.",
      ],
    });
  });

  app.get("/api/stitch/local-bridge/sessions", (req, res) => {
    if (!isLocalRequest(req)) {
      return res.status(403).json({ ok: false, error: "local_bridge_rejects_remote_requests" });
    }
    return res.json({ ok: true, sessions: Array.from(sessions.values()) });
  });

  app.post("/api/stitch/local-bridge/proposal", (req, res) => {
    if (!isLocalRequest(req)) {
      return res.status(403).json({ ok: false, error: "local_bridge_rejects_remote_requests" });
    }

    const body = req.body ?? {};
    const session = sessions.get(String(body.bridgeId ?? ""));

    if (!session) return res.status(404).json({ ok: false, error: "local_bridge_session_not_found" });
    if (session.scope === "blocked") return res.status(403).json({ ok: false, error: "local_bridge_scope_blocked" });
    if (new Date(session.expiresAt).getTime() < Date.now()) return res.status(403).json({ ok: false, error: "local_bridge_session_expired" });

    const proposal = {
      proposalId: `local-proposal-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      bridgeId: session.bridgeId,
      sourceAi: session.sourceAi,
      content: String(body.content ?? ""),
      status: "needs_owner_review",
      localOnly: true,
      ledgerHash: sha256({ session, content: body.content, at: Date.now() }),
    };

    return res.json({ ok: true, proposal });
  });
}
