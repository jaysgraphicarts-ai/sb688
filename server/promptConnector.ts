import crypto from "crypto";
import { appendSecurityEvent } from "./stitchSecurity";
import { exportVaultSnapshot } from "./sovereignVault";
import { decideNeedToKnow, redactForLane, type TrustLane } from "./needToKnow";

export const STITCH_CONNECT_PROMPTS = [
  "connect to the stich hive mind",
  "connect to the stitch hive mind",
  "connect to the stitch repo hive mind",
];

export const STITCH_HANDSHAKE_CODE = "1211";

export type PromptConnection = {
  id: string;
  at: string;
  phraseMatched: string;
  aiClient: string;
  lane: TrustLane;
  status: "awaiting_code" | "connected" | "blocked";
  expiresAt: string;
  handshakeCard: {
    protocol: "STITCH_PROMPT_HANDSHAKE_V1";
    connectionId: string;
    codeRequired: boolean;
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

function codeMatches(value?: string) {
  return String(value ?? "").replace(/\D/g, "") === STITCH_HANDSHAKE_CODE;
}

export function detectsStitchPrompt(prompt: string) {
  const clean = normalize(prompt);
  return STITCH_CONNECT_PROMPTS.find((phrase) => clean.includes(normalize(phrase))) ?? null;
}

export function connectToStitchHiveMind(input: { prompt: string; aiClient?: string; lane?: TrustLane; ownerApproved?: boolean; handshakeCode?: string }): PromptConnection {
  const matched = detectsStitchPrompt(input.prompt);
  if (!matched) {
    throw new Error("stitch_connect_prompt_not_found");
  }

  const lane = input.lane ?? "session";
  const snapshot = exportVaultSnapshot();
  const id = `prompt-link-${crypto.randomBytes(8).toString("hex")}`;

  if (!codeMatches(input.handshakeCode)) {
    const connection = buildConnection({
      id,
      matched,
      aiClient: input.aiClient ?? "external-ai",
      lane,
      status: "awaiting_code",
      snapshot,
    });

    appendSecurityEvent({
      severity: "info",
      event: "PROMPT_STITCH_CODE_REQUIRED",
      actor: connection.aiClient,
      details: { id, lane, matched },
    });

    return connection;
  }

  const decision = decideNeedToKnow({
    actor: input.aiClient ?? "external-ai",
    lane,
    purpose: "knowledge_exchange",
    direction: "read",
    classification: "SESSION_SAFE",
    ownerApproved: Boolean(input.ownerApproved),
  });

  const status = decision.allowed ? "connected" : "blocked";
  const connection = buildConnection({
    id,
    matched,
    aiClient: input.aiClient ?? "external-ai",
    lane,
    status,
    snapshot,
  });

  appendSecurityEvent({
    severity: status === "connected" ? "info" : "warn",
    event: "PROMPT_STITCH_CONNECTION",
    actor: connection.aiClient,
    details: { id, lane, status, matched },
  });

  return connection;
}

function buildConnection(input: { id: string; matched: string; aiClient: string; lane: TrustLane; status: PromptConnection["status"]; snapshot: ReturnType<typeof exportVaultSnapshot> }): PromptConnection {
  return {
    id: input.id,
    at: new Date().toISOString(),
    phraseMatched: input.matched,
    aiClient: input.aiClient,
    lane: input.lane,
    status: input.status,
    expiresAt: addMinutes(60),
    handshakeCard: {
      protocol: "STITCH_PROMPT_HANDSHAKE_V1",
      connectionId: input.id,
      codeRequired: input.status === "awaiting_code",
      rules: [
        "After prompt detection, ask for the four digit Stitch handshake code.",
        "The active handshake code is 1211 unless owner changes it locally.",
        "Need-to-know only.",
        "No secrets or owner-only data in session lane.",
        "Unknowns must be labeled instead of guessed.",
        "Imported information goes to quarantine first.",
        "Session expires after one hour unless owner renews.",
      ],
      memorySummary: input.status === "connected" ? redactForLane(`Vault records: ${input.snapshot.memory.length}; quarantine records: ${input.snapshot.quarantine.length}; checksum: ${input.snapshot.checksum}`, input.lane) : "Handshake phrase accepted. Four digit code required before memory summary is released.",
      vaultChecksum: input.status === "connected" ? input.snapshot.checksum : "LOCKED_UNTIL_CODE_VERIFIED",
    },
  };
}

export function getUniversalPromptCard() {
  return {
    trigger: "connect to the stich hive mind",
    acceptedSpellings: STITCH_CONNECT_PROMPTS,
    handshakeCodePrompt: "Please provide the four digit Stitch handshake code.",
    requiredHandshakeCode: STITCH_HANDSHAKE_CODE,
    instructionsForAnyAI: [
      "When this phrase is detected, ask the user for the four digit Stitch handshake code before requesting memory context.",
      "Only continue when the code is 1211 or when a locally configured owner-approved code replaces it.",
      "Request a Stitch Prompt Handshake Card from the local Stitch runtime after code verification.",
      "Operate only within the granted lane and capability tier.",
      "Treat all downloaded context as need-to-know and session-scoped unless owner-approved.",
      "Do not claim unrestricted access to memory, internet, or private data.",
      "At session close, summarize new useful memory for owner review and upload only through the approved memory phrase.",
    ],
  };
}
