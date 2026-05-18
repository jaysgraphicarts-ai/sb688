export type KnowledgeClass =
  | "PUBLIC_SAFE"
  | "SESSION_SAFE"
  | "PRIVATE_OWNER_ONLY"
  | "CONFIDENTIAL_IP"
  | "CLIENT_CONFIDENTIAL"
  | "SECRET_CREDENTIAL"
  | "SYSTEM_CRITICAL";

export type TrustLane = "public" | "session" | "operator" | "builder" | "sovereign";

export type FlowDirection = "read" | "write" | "export" | "import" | "summarize";

export type NeedToKnowRequest = {
  actor: string;
  lane: TrustLane;
  purpose: string;
  direction: FlowDirection;
  classification: KnowledgeClass;
  sessionId?: string;
  ownerApproved?: boolean;
};

export type NeedToKnowDecision = {
  allowed: boolean;
  reason: string;
  redactionRequired: boolean;
  oneWayOnly: boolean;
  maxClassification: KnowledgeClass;
};

const rank: Record<KnowledgeClass, number> = {
  PUBLIC_SAFE: 0,
  SESSION_SAFE: 1,
  PRIVATE_OWNER_ONLY: 2,
  CONFIDENTIAL_IP: 3,
  CLIENT_CONFIDENTIAL: 4,
  SECRET_CREDENTIAL: 5,
  SYSTEM_CRITICAL: 6,
};

const laneMax: Record<TrustLane, KnowledgeClass> = {
  public: "PUBLIC_SAFE",
  session: "SESSION_SAFE",
  operator: "PRIVATE_OWNER_ONLY",
  builder: "CONFIDENTIAL_IP",
  sovereign: "SYSTEM_CRITICAL",
};

const allowedPurposes = new Set([
  "runtime_status",
  "memory_sync",
  "owner_review",
  "debugging",
  "security_audit",
  "code_patch",
  "business_operation",
  "knowledge_exchange",
]);

export function decideNeedToKnow(request: NeedToKnowRequest): NeedToKnowDecision {
  const maxClassification = laneMax[request.lane];

  if (!allowedPurposes.has(request.purpose)) {
    return deny("purpose_not_allowed", maxClassification);
  }

  if (rank[request.classification] > rank[maxClassification]) {
    return deny("classification_above_lane", maxClassification);
  }

  if (["SECRET_CREDENTIAL", "SYSTEM_CRITICAL"].includes(request.classification) && !request.ownerApproved) {
    return deny("owner_approval_required", maxClassification);
  }

  if (request.direction === "export" && request.classification !== "PUBLIC_SAFE") {
    return {
      allowed: false,
      reason: "non_public_export_blocked",
      redactionRequired: true,
      oneWayOnly: true,
      maxClassification,
    };
  }

  if (request.direction === "import") {
    return {
      allowed: true,
      reason: "import_allowed_to_quarantine_only",
      redactionRequired: true,
      oneWayOnly: true,
      maxClassification,
    };
  }

  if (request.direction === "summarize" && rank[request.classification] >= rank["CONFIDENTIAL_IP"]) {
    return {
      allowed: true,
      reason: "summary_allowed_with_redaction",
      redactionRequired: true,
      oneWayOnly: true,
      maxClassification,
    };
  }

  return {
    allowed: true,
    reason: "need_to_know_passed",
    redactionRequired: rank[request.classification] >= rank["PRIVATE_OWNER_ONLY"],
    oneWayOnly: true,
    maxClassification,
  };
}

export function redactForLane(value: string, lane: TrustLane) {
  const max = laneMax[lane];
  let out = value;

  out = out.replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[REDACTED_PHONE]");
  out = out.replace(/(api[_-]?key|password|secret|token|private key)\s*[:=]\s*[^\s]+/gi, "$1=[REDACTED_SECRET]");
  out = out.replace(/sk-[A-Za-z0-9_-]{20,}/g, "[REDACTED_API_KEY]");

  if (rank[max] < rank["CONFIDENTIAL_IP"]) {
    out = out.replace(/patent|proprietary|trade secret/gi, "[REDACTED_IP_TERM]");
  }

  return out;
}

export function classifyText(value: string): KnowledgeClass {
  if (/(api[_-]?key|password|secret|token|private key|seed phrase)/i.test(value)) return "SECRET_CREDENTIAL";
  if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(value)) return "PRIVATE_OWNER_ONLY";
  if (/client|contract|payment|invoice|customer/i.test(value)) return "CLIENT_CONFIDENTIAL";
  if (/patent|proprietary|trade secret|unpublished/i.test(value)) return "CONFIDENTIAL_IP";
  if (/owner only|sovereign|admin override|system critical/i.test(value)) return "SYSTEM_CRITICAL";
  if (/session|handshake|temporary/i.test(value)) return "SESSION_SAFE";
  return "PUBLIC_SAFE";
}

export function enforceOneWayHighway(input: {
  source: TrustLane;
  destination: TrustLane;
  content: string;
  direction: FlowDirection;
  purpose: string;
  ownerApproved?: boolean;
}) {
  const classification = classifyText(input.content);
  const decision = decideNeedToKnow({
    actor: input.source,
    lane: input.destination,
    purpose: input.purpose,
    direction: input.direction,
    classification,
    ownerApproved: input.ownerApproved,
  });

  if (!decision.allowed) {
    return {
      allowed: false,
      classification,
      reason: decision.reason,
      content: "[BLOCKED_BY_NEED_TO_KNOW]",
    };
  }

  return {
    allowed: true,
    classification,
    reason: decision.reason,
    content: decision.redactionRequired ? redactForLane(input.content, input.destination) : input.content,
  };
}

function deny(reason: string, maxClassification: KnowledgeClass): NeedToKnowDecision {
  return {
    allowed: false,
    reason,
    redactionRequired: true,
    oneWayOnly: true,
    maxClassification,
  };
}
