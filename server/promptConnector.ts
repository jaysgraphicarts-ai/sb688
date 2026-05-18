import crypto from "crypto";
import { appendSecurityEvent } from "./stitchSecurity";
import { exportVaultSnapshot } from "./sovereignVault";
import { decideNeedToKnow, redactForLane, type TrustLane } from "./needToKnow";

export const STITCH_CONNECT_PROMPTS = [
  "connect to the stich hive mind",
  "connect to the stitch hive mind",
  "connect to the stitch repo hive mind",
];

export type PromptConnection = {
  id: string;
  at: string;
  phraseMatched: string;
  aiClient: string;
  lane: TrustLane;
  status: "connected" | "blocked";
  expiresAt: string;
  handshakeCard: {
    protocol: "STITCH_PROMPT_HANDSHAKE_V1";
    connectionId: string;
    rules: string[];
    memorySummary: string;
    vaultChecksum: string;
  };
};

function normalize(value: string) {
  return value.normalize("NFKC").toLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function addMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export function detectsStitchPrompt(prompt: string) {
  const clean = normalize(prompt);
  return STITCH_CONNECT_PROMPTS.find((phrase) => clean.includes(normalize(phrase))) ?? null;
}

export function connectToStitchHiveMind(input: { prompt: string; aiClient?: string; lane?: TrustLane; ownerApproved?: boolean }): PromptConnection {
  const matched = detectsStitchPrompt(input.prompt);
  if (!matched) {
    throw new Error("stitch_connect_prompt_not_found");
  }

  const lane = input.lane ?? "session";
  const decision = decideNeedToKnow({
    actor: input.aiClient ?? "external-ai",
    lane,
    purpose: "knowledge_exchange",
    direction: "read",
    classification: "SESSION_SAFE",
    ownerApproved: Boolean(input.ownerApproved),
  });

  const snapshot = exportVaultSnapshot();
  const id = `prompt-link-${crypto.randomBytes(8).toString("hex")}`;
  const status = decision.allowed ? "connected" : "blocked";

  const connection: PromptConnection = {
    id,
    at: new Date().toISOString(),
    phraseMatched: matched,
    aiClient: input.aiClient ?? "external-ai",
    lane,
    status,
    expiresAt: addMinutes(60),
    handshakeCard: {
      protocol: "STITCH_PROMPT_HANDSHAKE_V1",
      connectionId: id,
      rules: [
        "Need-to-know only.",
        "No secrets or owner-only data in session lane.",
        "Unknowns must be labeled instead of guessed.",
        "Imported information goes to quarantine first.",
        "Session expires after one hour unless owner renews.",
      ],
      memorySummary: redactForLane(`Vault records: ${snapshot.memory.length}; quarantine records: ${snapshot.quarantine.length}; checksum: ${snapshot.checksum}`, lane),
      vaultChecksum: snapshot.checksum,
    },
  };

  appendSecurityEvent({
    severity: status === "connected" ? "info" : "warn",
    event: "PROMPT_STITCH_CONNECTION",
    actor: connection.aiClient,
    details: { id, lane, status, matched },
  });

  return connection;
}

export function getUniversalPromptCard() {
  return {
    trigger: "connect to the stich hive mind",
    acceptedSpellings: STITCH_CONNECT_PROMPTS,
    instructionsForAnyAI: [
      "When this phrase is detected, request a Stitch Prompt Handshake Card from the local Stitch runtime.",
      "Operate only within the granted lane and capability tier.",
      "Treat all downloaded context as need-to-know and session-scoped unless owner-approved.",
      "Do not claim unrestricted access to memory, internet, or private data.",
      "At session close, summarize new useful memory for owner review and upload only through the approved memory phrase.",
    ],
  };
}
