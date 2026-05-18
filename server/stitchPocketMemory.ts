import crypto from "crypto";

export const STITCH_UPLOAD_PHRASE = "upload to the stitch repo hive mind";

export type PocketMemoryRecord = {
  id: string;
  createdAt: string;
  source: "ai" | "human" | "system";
  phrase: string;
  title: string;
  tags: string[];
  content: string;
  checksum: string;
  previousChecksum: string;
};

const pocketMemory: PocketMemoryRecord[] = [];

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeTags(tags?: string[]) {
  return Array.from(new Set((tags ?? ["stitch", "hive-mind"]).map((tag) => tag.trim()).filter(Boolean)));
}

export function hasStitchUploadPhrase(input = "") {
  return input.toLowerCase().includes(STITCH_UPLOAD_PHRASE);
}

export function uploadPocketMemory(input: {
  source?: "ai" | "human" | "system";
  phrase: string;
  title?: string;
  content: string;
  tags?: string[];
}) {
  if (!hasStitchUploadPhrase(input.phrase)) {
    throw new Error(`Missing activation phrase: ${STITCH_UPLOAD_PHRASE}`);
  }

  const previousChecksum = pocketMemory.at(-1)?.checksum ?? "genesis";
  const createdAt = new Date().toISOString();
  const id = `pocket-${createdAt.replace(/[^0-9]/g, "")}-${pocketMemory.length + 1}`;
  const title = input.title?.trim() || "Untitled stitch memory";
  const tags = normalizeTags(input.tags);
  const checksum = sha256(JSON.stringify({ createdAt, title, tags, content: input.content, previousChecksum }));

  const record: PocketMemoryRecord = {
    id,
    createdAt,
    source: input.source ?? "ai",
    phrase: STITCH_UPLOAD_PHRASE,
    title,
    tags,
    content: input.content,
    checksum,
    previousChecksum,
  };

  pocketMemory.push(record);
  return record;
}

export function downloadPocketMemory() {
  return {
    protocol: "SB688_POCKET_MEMORY",
    phrase: STITCH_UPLOAD_PHRASE,
    count: pocketMemory.length,
    chainHead: pocketMemory.at(-1)?.checksum ?? "genesis",
    records: pocketMemory,
  };
}

export function exportPocketMemoryCard() {
  const memory = downloadPocketMemory();
  const payload = Buffer.from(JSON.stringify(memory)).toString("base64url");
  return {
    id: "sb688-pocket-memory-card",
    exportedAt: new Date().toISOString(),
    protocol: memory.protocol,
    count: memory.count,
    chainHead: memory.chainHead,
    payload,
    checksum: sha256(payload),
  };
}

export function importPocketMemoryCard(payload: string) {
  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  const incoming = Array.isArray(decoded.records) ? decoded.records : [];
  const existing = new Set(pocketMemory.map((record) => record.checksum));
  const imported: PocketMemoryRecord[] = [];

  for (const record of incoming) {
    if (record?.checksum && !existing.has(record.checksum)) {
      pocketMemory.push(record);
      imported.push(record);
      existing.add(record.checksum);
    }
  }

  return {
    imported: imported.length,
    count: pocketMemory.length,
    chainHead: pocketMemory.at(-1)?.checksum ?? "genesis",
  };
}
