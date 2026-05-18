import crypto from "crypto";
import fs from "fs";
import path from "path";
import { appendSecurityEvent } from "./stitchSecurity";

export type PromisePoint = {
  promiseId: string;
  at: string;
  owner: string;
  scope: string;
  summary: string;
  affectedBricks: string[];
  affectedStates: string[];
  checkpointHash: string;
  previousCheckpointHash: string;
  status: "active" | "sealed";
};

function vaultDir() {
  return process.env.STITCH_VAULT_DIR ?? path.resolve(process.cwd(), ".stitch-vault");
}

function protocolPath() {
  return path.join(vaultDir(), "promise-points.json");
}

function sha256(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function readPoints(): PromisePoint[] {
  if (!fs.existsSync(protocolPath())) return [];
  return JSON.parse(fs.readFileSync(protocolPath(), "utf8"));
}

function writePoints(points: PromisePoint[]) {
  fs.mkdirSync(vaultDir(), { recursive: true, mode: 0o700 });
  fs.writeFileSync(protocolPath(), JSON.stringify(points, null, 2), { mode: 0o600 });
}

export function tieIn(scope: string) {
  const points = readPoints();
  const last = points.at(-1) ?? null;

  appendSecurityEvent({
    severity: "info",
    event: "TIE_IN",
    actor: "owners-room",
    details: {
      scope,
      lastPromiseId: last?.promiseId ?? null,
      lastCheckpoint: last?.checkpointHash ?? "genesis",
    },
  });

  return {
    connected: true,
    lastPromisePoint: last,
    recommendations: [
      "verify current runtime state",
      "review unresolved risks",
      "run boundary diagnostics before deployment",
    ],
  };
}

export function tieOff(input: {
  owner: string;
  scope: string;
  summary: string;
  affectedBricks?: string[];
  affectedStates?: string[];
}) {
  const points = readPoints();
  const previous = points.at(-1);

  const point: PromisePoint = {
    promiseId: `pp-${Date.now()}`,
    at: new Date().toISOString(),
    owner: input.owner,
    scope: input.scope,
    summary: input.summary,
    affectedBricks: input.affectedBricks ?? [],
    affectedStates: input.affectedStates ?? [],
    previousCheckpointHash: previous?.checkpointHash ?? "genesis",
    checkpointHash: sha256({ input, previous: previous?.checkpointHash ?? "genesis", at: Date.now() }),
    status: "sealed",
  };

  points.push(point);
  writePoints(points);

  appendSecurityEvent({
    severity: "info",
    event: "TIE_OFF",
    actor: "owners-room",
    details: {
      promiseId: point.promiseId,
      checkpointHash: point.checkpointHash,
      scope: point.scope,
    },
  });

  return {
    sealed: true,
    promisePoint: point,
    nextTieIn: {
      promiseId: point.promiseId,
      checkpointHash: point.checkpointHash,
    },
  };
}
