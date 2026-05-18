import fs from "fs";
import path from "path";
import crypto from "crypto";

export type SecuritySeverity = "info" | "warn" | "critical";

export type SecurityEventInput = {
  severity: SecuritySeverity;
  event: string;
  actor: string;
  details?: Record<string, unknown>;
};

export type SecurityEvent = SecurityEventInput & {
  id: string;
  at: string;
  prevHash: string;
  hash: string;
};

function vaultDir() {
  return process.env.STITCH_VAULT_DIR ?? process.env.STITCH_VAULT_PATH ?? path.resolve(process.cwd(), ".stitch-vault");
}

function ledgerPath() {
  return path.join(vaultDir(), "security-ledger.jsonl");
}

function sha256(value: unknown) {
  return crypto.createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
}

function ensureVault() {
  fs.mkdirSync(vaultDir(), { recursive: true, mode: 0o700 });
}

function lastHash(): string {
  const file = ledgerPath();
  if (!fs.existsSync(file)) return "genesis";
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  if (!lines.length) return "genesis";
  try {
    return JSON.parse(lines.at(-1) ?? "{}").hash ?? "genesis";
  } catch {
    return "corrupt_tail";
  }
}

export function appendSecurityEvent(input: SecurityEventInput): SecurityEvent {
  ensureVault();
  const prevHash = lastHash();
  const draft = {
    id: `sec-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    at: new Date().toISOString(),
    severity: input.severity,
    event: input.event,
    actor: input.actor,
    details: redactDetails(input.details ?? {}),
    prevHash,
  };
  const entry: SecurityEvent = { ...draft, hash: sha256(draft) };
  fs.appendFileSync(ledgerPath(), `${JSON.stringify(entry)}\n`, { mode: 0o600 });
  return entry;
}

export function verifySecurityLedger() {
  const file = ledgerPath();
  if (!fs.existsSync(file)) return { ok: true, entries: 0, tip: "genesis" };
  const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean);
  let prevHash = "genesis";
  for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]) as SecurityEvent;
    const { hash, ...draft } = entry;
    if (entry.prevHash !== prevHash) return { ok: false, entries: i, tip: prevHash, error: "prev_hash_mismatch" };
    if (sha256(draft) !== hash) return { ok: false, entries: i, tip: prevHash, error: "hash_mismatch" };
    prevHash = hash;
  }
  return { ok: true, entries: lines.length, tip: prevHash };
}

function redactDetails(details: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (/pass|code|secret|token|key/i.test(key)) {
      clean[key] = "[REDACTED]";
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
