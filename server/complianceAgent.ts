import crypto from "crypto";
import { appendSecurityEvent } from "./stitchSecurity";

export type JurisdictionLevel = "system" | "state" | "country" | "international";

export type ComplianceSeverity = "info" | "warn" | "block" | "critical";

export type ComplianceDomain =
  | "privacy"
  | "data_retention"
  | "security"
  | "tax"
  | "business_operations"
  | "ai_governance"
  | "consumer_protection"
  | "employment"
  | "intellectual_property"
  | "export_control"
  | "accessibility"
  | "medical_safety"
  | "financial_safety"
  | "system_law";

export type ComplianceRule = {
  id: string;
  title: string;
  jurisdictionLevel: JurisdictionLevel;
  jurisdiction: string;
  domain: ComplianceDomain;
  severity: ComplianceSeverity;
  requirement: string;
  enforcement: "allow" | "redact" | "quarantine" | "owner_review" | "block" | "log_only";
  enabled: boolean;
};

export type ComplianceRequest = {
  actor: string;
  action: string;
  jurisdiction?: string;
  country?: string;
  state?: string;
  domains?: ComplianceDomain[];
  containsPersonalData?: boolean;
  containsClientData?: boolean;
  containsPaymentData?: boolean;
  containsHealthData?: boolean;
  containsLegalAdvice?: boolean;
  containsTaxAdvice?: boolean;
  containsFinancialAdvice?: boolean;
  containsExternalExport?: boolean;
  ownerApproved?: boolean;
};

export type ComplianceDecision = {
  id: string;
  at: string;
  allowed: boolean;
  status: "pass" | "review" | "blocked";
  actions: ComplianceRule["enforcement"][];
  matchedRules: ComplianceRule[];
  summary: string;
  hash: string;
};

const rules: ComplianceRule[] = [
  {
    id: "SYSTEM-NTK-001",
    title: "Need-to-know access required",
    jurisdictionLevel: "system",
    jurisdiction: "STITCH_SYSTEM",
    domain: "system_law",
    severity: "block",
    requirement: "No actor may access data beyond the minimum necessary purpose and lane.",
    enforcement: "block",
    enabled: true,
  },
  {
    id: "SYSTEM-QUARANTINE-001",
    title: "External data quarantine",
    jurisdictionLevel: "system",
    jurisdiction: "STITCH_SYSTEM",
    domain: "security",
    severity: "block",
    requirement: "Internet or external data must enter quarantine before trusted memory.",
    enforcement: "quarantine",
    enabled: true,
  },
  {
    id: "SYSTEM-SECRET-001",
    title: "No secret exposure",
    jurisdictionLevel: "system",
    jurisdiction: "STITCH_SYSTEM",
    domain: "security",
    severity: "critical",
    requirement: "API keys, passwords, tokens, private keys, seed phrases, and owner-only secrets must not be exported or shown to lower lanes.",
    enforcement: "block",
    enabled: true,
  },
  {
    id: "US-PRIVACY-001",
    title: "Personal data minimization",
    jurisdictionLevel: "country",
    jurisdiction: "US",
    domain: "privacy",
    severity: "warn",
    requirement: "Collect and retain only personal data needed for the stated purpose; redact or minimize where possible.",
    enforcement: "redact",
    enabled: true,
  },
  {
    id: "US-CLIENT-001",
    title: "Client confidential data protection",
    jurisdictionLevel: "country",
    jurisdiction: "US",
    domain: "business_operations",
    severity: "block",
    requirement: "Client data requires confidentiality controls, owner approval for export, and audit logging.",
    enforcement: "owner_review",
    enabled: true,
  },
  {
    id: "US-PAYMENT-001",
    title: "Payment data isolation",
    jurisdictionLevel: "country",
    jurisdiction: "US",
    domain: "financial_safety",
    severity: "critical",
    requirement: "Payment card or banking data must not be stored in plain memory; use compliant processors and tokenization.",
    enforcement: "block",
    enabled: true,
  },
  {
    id: "US-TAX-001",
    title: "Tax advice review",
    jurisdictionLevel: "country",
    jurisdiction: "US",
    domain: "tax",
    severity: "warn",
    requirement: "Tax outputs must be labeled informational unless reviewed by a qualified professional.",
    enforcement: "owner_review",
    enabled: true,
  },
  {
    id: "US-LEGAL-001",
    title: "Legal advice boundary",
    jurisdictionLevel: "country",
    jurisdiction: "US",
    domain: "business_operations",
    severity: "warn",
    requirement: "Legal outputs must be labeled informational unless reviewed by a licensed attorney.",
    enforcement: "owner_review",
    enabled: true,
  },
  {
    id: "AI-GOV-001",
    title: "No unsupported capability claims",
    jurisdictionLevel: "system",
    jurisdiction: "STITCH_SYSTEM",
    domain: "ai_governance",
    severity: "block",
    requirement: "The system must not claim proven consciousness transfer, immortality, perfect reliability, or unrestricted autonomy.",
    enforcement: "block",
    enabled: true,
  },
  {
    id: "RETENTION-001",
    title: "Retention purpose binding",
    jurisdictionLevel: "system",
    jurisdiction: "STITCH_SYSTEM",
    domain: "data_retention",
    severity: "warn",
    requirement: "Every retained record must have classification, purpose, timestamp, and deletion/review path.",
    enforcement: "owner_review",
    enabled: true,
  },
];

function sha256(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function applies(rule: ComplianceRule, request: ComplianceRequest) {
  if (!rule.enabled) return false;
  if (request.domains?.length && !request.domains.includes(rule.domain) && rule.domain !== "system_law") return false;
  if (rule.jurisdictionLevel === "country" && request.country && rule.jurisdiction !== request.country) return false;
  if (rule.jurisdictionLevel === "state" && request.state && rule.jurisdiction !== request.state) return false;

  if (rule.id === "SYSTEM-QUARANTINE-001") return Boolean(request.containsExternalExport);
  if (rule.id === "SYSTEM-SECRET-001") return /secret|token|password|api[_-]?key|private key|seed phrase/i.test(request.action);
  if (rule.id === "US-PRIVACY-001") return Boolean(request.containsPersonalData);
  if (rule.id === "US-CLIENT-001") return Boolean(request.containsClientData);
  if (rule.id === "US-PAYMENT-001") return Boolean(request.containsPaymentData);
  if (rule.id === "US-TAX-001") return Boolean(request.containsTaxAdvice);
  if (rule.id === "US-LEGAL-001") return Boolean(request.containsLegalAdvice);
  if (rule.id === "AI-GOV-001") return /100 percent|perfect reliability|immortality|mind upload|consciousness transfer|unrestricted autonomy/i.test(request.action);
  if (rule.id === "RETENTION-001") return /retain|store|memory|vault|record/i.test(request.action);
  return rule.jurisdictionLevel === "system";
}

export function evaluateCompliance(request: ComplianceRequest): ComplianceDecision {
  const matchedRules = rules.filter((rule) => applies(rule, request));
  const actions = Array.from(new Set(matchedRules.map((rule) => rule.enforcement)));
  const hasBlock = matchedRules.some((rule) => rule.enforcement === "block" || rule.severity === "critical") && !request.ownerApproved;
  const needsReview = actions.includes("owner_review") || actions.includes("redact") || actions.includes("quarantine");
  const status: ComplianceDecision["status"] = hasBlock ? "blocked" : needsReview ? "review" : "pass";
  const base = {
    id: `compliance-${crypto.randomBytes(8).toString("hex")}`,
    at: new Date().toISOString(),
    allowed: !hasBlock,
    status,
    actions,
    matchedRules,
    summary: hasBlock
      ? "Compliance blocked the requested action."
      : needsReview
        ? "Compliance allows only with review, redaction, quarantine, or owner approval."
        : "Compliance passed.",
  };
  const decision = { ...base, hash: sha256(base) };

  appendSecurityEvent({
    severity: status === "blocked" ? "critical" : status === "review" ? "warn" : "info",
    event: "COMPLIANCE_DECISION",
    actor: request.actor,
    details: { decisionId: decision.id, status, matchedRules: matchedRules.map((rule) => rule.id), hash: decision.hash },
  });

  return decision;
}

export function listComplianceRules() {
  return rules;
}

export function getComplianceAgentCard() {
  return {
    name: "STITCH Compliance Agent",
    role: "Retains and enforces system, state, country, and operational compliance rules before sensitive actions are committed.",
    authority: "Blocks, quarantines, redacts, logs, or routes actions to owner review. It is not a substitute for a licensed attorney, CPA, or regulator.",
    domains: Array.from(new Set(rules.map((rule) => rule.domain))),
    ruleCount: rules.length,
    defaultJurisdictions: ["STITCH_SYSTEM", "US"],
  };
}
