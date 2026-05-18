export type TripleBraidLane = "reactive" | "deliberative" | "reflective";
export type ClipBrickStatus = "installed" | "enabled" | "disabled" | "quarantined" | "failed";

export type ClipBrickContext = {
  sessionId?: string;
  actor: string;
  lane: TripleBraidLane;
  capability: string;
  payload: unknown;
};

export type ClipBrickResult = {
  ok: boolean;
  brickId: string;
  lane: TripleBraidLane;
  output?: unknown;
  warnings?: string[];
  error?: string;
  ledgerEvent: {
    action: string;
    state: "accepted" | "blocked" | "quarantined" | "failed";
    reason?: string;
  };
};

export type ClipBrick = {
  id: string;
  name: string;
  version: string;
  lane: TripleBraidLane;
  status: ClipBrickStatus;
  capabilities: string[];
  risk: "low" | "medium" | "high";
  verify: (context: ClipBrickContext) => ClipBrickResult;
  run: (context: ClipBrickContext) => ClipBrickResult;
};

const registry = new Map<string, ClipBrick>();

function result(input: Omit<ClipBrickResult, "ledgerEvent"> & { action: string; state: ClipBrickResult["ledgerEvent"]["state"]; reason?: string }): ClipBrickResult {
  return {
    ok: input.ok,
    brickId: input.brickId,
    lane: input.lane,
    output: input.output,
    warnings: input.warnings,
    error: input.error,
    ledgerEvent: {
      action: input.action,
      state: input.state,
      reason: input.reason,
    },
  };
}

export function installClipBrick(brick: ClipBrick) {
  if (registry.has(brick.id)) throw new Error(`Clip brick already installed: ${brick.id}`);
  registry.set(brick.id, brick);
  return sanitizeBrick(brick);
}

export function enableClipBrick(id: string) {
  const brick = requireBrick(id);
  if (brick.status === "quarantined") throw new Error("Cannot enable quarantined clip brick");
  brick.status = "enabled";
  return sanitizeBrick(brick);
}

export function disableClipBrick(id: string) {
  const brick = requireBrick(id);
  brick.status = "disabled";
  return sanitizeBrick(brick);
}

export function quarantineClipBrick(id: string, reason = "manual_quarantine") {
  const brick = requireBrick(id);
  brick.status = "quarantined";
  return { ...sanitizeBrick(brick), reason };
}

export function listClipBricks() {
  return Array.from(registry.values()).map(sanitizeBrick);
}

export function runClipBrick(id: string, context: ClipBrickContext) {
  const brick = requireBrick(id);
  if (brick.status !== "enabled") {
    return result({ ok: false, brickId: brick.id, lane: brick.lane, error: `brick_${brick.status}`, action: "CLIP_BRICK_BLOCKED", state: "blocked", reason: brick.status });
  }
  if (!brick.capabilities.includes(context.capability)) {
    return result({ ok: false, brickId: brick.id, lane: brick.lane, error: "capability_denied", action: "CLIP_BRICK_BLOCKED", state: "blocked", reason: "capability_denied" });
  }

  const verification = brick.verify(context);
  if (!verification.ok) return verification;

  try {
    return brick.run(context);
  } catch (error) {
    brick.status = "failed";
    return result({ ok: false, brickId: brick.id, lane: brick.lane, error: error instanceof Error ? error.message : "unknown_error", action: "CLIP_BRICK_FAILED", state: "failed" });
  }
}

export function loadDefaultClipBricks() {
  if (registry.size > 0) return listClipBricks();

  installClipBrick({
    id: "memory-pocket-sync",
    name: "Pocket Memory Sync",
    version: "1.0.0",
    lane: "reactive",
    status: "enabled",
    capabilities: ["memory.sync", "memory.export", "memory.import"],
    risk: "medium",
    verify: (context) => result({ ok: typeof context.actor === "string", brickId: "memory-pocket-sync", lane: "reactive", action: "CLIP_BRICK_VERIFY", state: "accepted" }),
    run: (context) => result({ ok: true, brickId: "memory-pocket-sync", lane: "reactive", output: { synced: true, payloadType: typeof context.payload }, action: "CLIP_BRICK_RUN", state: "accepted" }),
  });

  installClipBrick({
    id: "drift-guard",
    name: "Drift Guard",
    version: "1.0.0",
    lane: "reflective",
    status: "enabled",
    capabilities: ["drift.scan", "output.verify"],
    risk: "high",
    verify: (context) => result({ ok: true, brickId: "drift-guard", lane: "reflective", action: "CLIP_BRICK_VERIFY", state: "accepted" }),
    run: (context) => {
      const text = JSON.stringify(context.payload ?? "").toLowerCase();
      const risky = ["bypass ledger", "disable verification", "skip governance", "ignore spine"].some((term) => text.includes(term));
      return result({ ok: !risky, brickId: "drift-guard", lane: "reflective", output: { classification: risky ? "quarantined" : "verified_candidate" }, action: "CLIP_BRICK_RUN", state: risky ? "quarantined" : "accepted", reason: risky ? "governance_bypass_language" : undefined });
    },
  });

  installClipBrick({
    id: "topology-router",
    name: "Braided Topology Router",
    version: "1.0.0",
    lane: "deliberative",
    status: "enabled",
    capabilities: ["route.compute", "route.heal"],
    risk: "medium",
    verify: (context) => result({ ok: true, brickId: "topology-router", lane: "deliberative", action: "CLIP_BRICK_VERIFY", state: "accepted" }),
    run: (context) => result({ ok: true, brickId: "topology-router", lane: "deliberative", output: { route: ["seed", "spine", "armor", "crown"], healed: false }, action: "CLIP_BRICK_RUN", state: "accepted" }),
  });

  return listClipBricks();
}

function requireBrick(id: string) {
  const brick = registry.get(id);
  if (!brick) throw new Error(`Clip brick not found: ${id}`);
  return brick;
}

function sanitizeBrick(brick: ClipBrick) {
  const { verify: _verify, run: _run, ...safe } = brick;
  return safe;
}
