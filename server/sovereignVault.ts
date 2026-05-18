import crypto from "crypto";
import fs from "fs";
import path from "path";

export type VaultClass =
  | "PUBLIC_SAFE"
  | "SESSION_SAFE"
  | "PRIVATE_OWNER_ONLY"
  | "CONFIDENTIAL_IP"
  | "CLIENT_CONFIDENTIAL"
  | "SECRET_CREDENTIAL"
  | "SYSTEM_CRITICAL";

export type VaultRecord = {
  id: string;
  at: string;
  title: string;
  classification: VaultClass;
  source: "human" | "ai" | "system" | "internet_quarantine";
  content: string;
  tags: string[];
  previousHash: string;
  hash: string;
};

const VAULT_DIR = process.env.STITCH_VAULT_DIR ?? path.resolve(process.cwd(), ".stitch-vault");
const VAULT_FILE = path.join(VAULT_DIR, "memory.jsonl");
const QUARANTINE_FILE = path.join(VAULT_DIR, "quarantine.jsonl");

function ensureVault() {
  fs.mkdirSync(VAULT_DIR, { recursive: true, mode: 0o700 });
  for (const file of [VAULT_FILE, QUARANTINE_FILE]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, "", { mode: 0o600 });
  }
}

function now() {
  return new Date().toISOString();
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stable(value: unknown) {
  return JSON.stringify(value, Object.keys(value as object).sort());
}

export function classifyVaultContent(value: string): VaultClass {
  if (/(api[_-]?key|password|secret|token|private key|seed phrase)/i.test(value)) return "SECRET_CREDENTIAL";
  if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(value)) return "PRIVATE_OWNER_ONLY";
  if (/client|contract|payment|invoice|customer/i.test(value)) return "CLIENT_CONFIDENTIAL";
  if (/patent|proprietary|trade secret|unpublished/i.test(value)) return "CONFIDENTIAL_IP";
  if (/owner only|sovereign|admin override|root control|system critical/i.test(value)) return "SYSTEM_CRITICAL";
  if (/session|handshake|temporary/i.test(value)) return "SESSION_SAFE";
  return "PUBLIC_SAFE";
}

export function appendVaultRecord(input: {
  title: string;
  content: string;
  source: VaultRecord["source"];
  tags?: string[];
  classification?: VaultClass;
  quarantine?: boolean;
}) {
  ensureVault();
  const file = input.quarantine ? QUARANTINE_FILE : VAULT_FILE;
  const records = readRecords(file);
  const previousHash = records.at(-1)?.hash ?? "GENESIS";
  const base = {
    id: `vault-${crypto.randomBytes(8).toString("hex")}`,
    at: now(),
    title: input.title,
    classification: input.classification ?? classifyVaultContent(input.content),
    source: input.source,
    content: input.content,
    tags: input.tags ?? [],
    previousHash,
  };
  const hash = sha256(stable(base));
  const record: VaultRecord = { ...base, hash };
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, { mode: 0o600 });
  return record;
}

export function importInternetQuarantine(input: { title: string; content: string; tags?: string[] }) {
  return appendVaultRecord({
    title: input.title,
    content: input.content,
    tags: ["internet", "quarantine", ...(input.tags ?? [])],
    source: "internet_quarantine",
    quarantine: true,
  });
}

export function promoteQuarantineRecord(id: string, ownerApproved: boolean) {
  if (!ownerApproved) throw new Error("owner_approval_required");
  ensureVault();
  const quarantine = readRecords(QUARANTINE_FILE);
  const found = quarantine.find((record) => record.id === id);
  if (!found) throw new Error("quarantine_record_not_found");
  return appendVaultRecord({
    title: found.title,
    content: found.content,
    source: "system",
    tags: [...found.tags, "promoted"],
    classification: found.classification,
  });
}

export function readVaultRecords() {
  ensureVault();
  return readRecords(VAULT_FILE);
}

export function readQuarantineRecords() {
  ensureVault();
  return readRecords(QUARANTINE_FILE);
}

export function verifyVault(file: "memory" | "quarantine" = "memory") {
  ensureVault();
  const target = file === "memory" ? VAULT_FILE : QUARANTINE_FILE;
  const records = readRecords(target);
  let previousHash = "GENESIS";
  for (const record of records) {
    const { hash, ...base } = record;
    if (base.previousHash !== previousHash) return { ok: false, reason: "previous_hash_mismatch", record };
    const expected = sha256(stable(base));
    if (hash !== expected) return { ok: false, reason: "hash_mismatch", record };
    previousHash = hash;
  }
  return { ok: true, count: records.length, head: previousHash };
}

export function exportVaultSnapshot() {
  ensureVault();
  const memory = readVaultRecords();
  const quarantine = readQuarantineRecords();
  const body = { exportedAt: now(), memory, quarantine, memoryCheck: verifyVault("memory"), quarantineCheck: verifyVault("quarantine") };
  return { ...body, checksum: sha256(JSON.stringify(body)) };
}

function readRecords(file: string): VaultRecord[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf-8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}
