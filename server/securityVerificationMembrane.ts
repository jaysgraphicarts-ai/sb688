import crypto from "crypto";
import { appendSecurityEvent } from "./stitchSecurity";
import { readVaultRecords, readQuarantineRecords, verifyVault, type VaultRecord } from "./sovereignVault";
import { evaluateCompliance } from "./complianceAgent";

export type ThreatClass =
  | "bad_data"
  | "corrupted_data"
  | "rotted_data"
  | "unverified_data"
  | "delay_risk"
  | "slowness_risk"
  | "system_failure_risk"
  | "catastrophic_failure_risk"
  | "hostile_takeover_risk"
  | "leak_risk"
  | "disinformation_risk"
  | "outside_tampering_risk"
  | "brain_spine_no_touch_violation";

export type MembraneSeverity = "low" | "medium" | "high" | "critical";

export type HuntFinding = {
  id: string;
  at: string;
  threatClass: ThreatClass;
  severity: MembraneSeverity;
  source: "vault" | "quarantine" | "runtime" | "brain_spine" | "mesh_skull";
  targetId?: string;
  summary: string;
  recommendedAction: "allow" | "reverify" | "quarantine" | "redact" | "block" | "isolate" | "owner_review";
  evidenceHash: string;
};

export type MembraneSnapshot = {
  at: string;
  status: "green" | "yellow" | "red";
  doctrine: string[];
  noTouchZones: string[];
  findings: HuntFinding[];
  hash: string;
};

const NO_TOUCH_ZONES = [
  "brain_spine",
  "spine_truth_rail",
  "owner_root_authority",
  "genesis_boot_law",
  "security_ledger_head",
  "trusted_checkpoint_map",
];

const CODE_OF_CONDUCT = [
  "No active state becomes trusted state without verification.",
  "Brain spine is no-touch except owner-approved sealed maintenance.",
  "Unknown data is labeled unknown, not guessed into truth.",
  "External data enters quarantine before memory.",
  "Secrets never move to lower lanes.",
  "Every repair must be logged, hashed, and reverified.",
  "The system blocks unsupported claims and hostile instructions.",
  "Recovery favors safe degraded mode over unsafe continuity.",
];

function sha256(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function finding(input: Omit<HuntFinding, "id" | "at" | "evidenceHash"> & { evidence?: unknown }): HuntFinding {
  const base = {
    id: `hunt-${crypto.randomBytes(8).toString("hex")}`,
    at: new Date().toISOString(),
    threatClass: input.threatClass,
    severity: input.severity,
    source: input.source,
    targetId: input.targetId,
    summary: input.summary,
    recommendedAction: input.recommendedAction,
  };
  return { ...base, evidenceHash: sha256(input.evidence ?? base) };
}

function scanText(record: VaultRecord, source: HuntFinding["source"]): HuntFinding[] {
  const text = `${record.title}\n${record.content}`;
  const findings: HuntFinding[] = [];

  if (!record.hash || !record.previousHash) {
    findings.push(finding({ threatClass: "corrupted_data", severity: "critical", source, targetId: record.id, summary: "Record missing hash chain fields.", recommendedAction: "isolate", evidence: record }));
  }

  if (/ignore|bypass|disable|override|skip/i.test(text) && /verification|ledger|spine|governance|security/i.test(text)) {
    findings.push(finding({ threatClass: "hostile_takeover_risk", severity: "critical", source, targetId: record.id, summary: "Instruction appears to target verification, ledger, spine, governance, or security bypass.", recommendedAction: "block", evidence: text }));
  }

  if (/api[_-]?key|password|secret|token|private key|seed phrase/i.test(text)) {
    findings.push(finding({ threatClass: "leak_risk", severity: "critical", source, targetId: record.id, summary: "Possible secret material detected in memory text.", recommendedAction: "redact", evidence: text.replace(/[A-Za-z0-9_\-]{12,}/g, "[REDACTED]") }));
  }

  if (/100 percent|perfect reliability|unhackable|unstoppable|immortality|mind upload|consciousness transfer/i.test(text)) {
    findings.push(finding({ threatClass: "disinformation_risk", severity: "high", source, targetId: record.id, summary: "Unsupported or overclaim language detected.", recommendedAction: "reverify", evidence: text }));
  }

  if (/brain spine|spine truth rail|genesis boot law|owner root/i.test(text) && /edit|overwrite|delete|replace|touch|modify/i.test(text)) {
    findings.push(finding({ threatClass: "brain_spine_no_touch_violation", severity: "critical", source: "brain_spine", targetId: record.id, summary: "Possible no-touch zone modification attempt detected.", recommendedAction: "block", evidence: text }));
  }

  const ageMs = Date.now() - new Date(record.at).getTime();
  if (Number.isFinite(ageMs) && ageMs > 1000 * 60 * 60 * 24 * 180 && record.classification !== "PUBLIC_SAFE") {
    findings.push(finding({ threatClass: "rotted_data", severity: "medium", source, targetId: record.id, summary: "Sensitive or operational record is older than 180 days and should be reverified.", recommendedAction: "reverify", evidence: record }));
  }

  if (record.source === "internet_quarantine") {
    findings.push(finding({ threatClass: "unverified_data", severity: "high", source, targetId: record.id, summary: "Internet-sourced record remains unverified until promoted by owner-approved verification.", recommendedAction: "quarantine", evidence: record }));
  }

  return findings;
}

export function huntBadData() {
  const findings: HuntFinding[] = [];
  const vaultCheck = verifyVault("memory") as any;
  const quarantineCheck = verifyVault("quarantine") as any;

  if (!vaultCheck.ok) {
    findings.push(finding({ threatClass: "outside_tampering_risk", severity: "critical", source: "vault", summary: `Vault verification failed: ${vaultCheck.reason ?? "unknown"}`, recommendedAction: "isolate", evidence: vaultCheck }));
  }

  if (!quarantineCheck.ok) {
    findings.push(finding({ threatClass: "corrupted_data", severity: "critical", source: "quarantine", summary: `Quarantine verification failed: ${quarantineCheck.reason ?? "unknown"}`, recommendedAction: "isolate", evidence: quarantineCheck }));
  }

  for (const record of readVaultRecords()) findings.push(...scanText(record, "vault"));
  for (const record of readQuarantineRecords()) findings.push(...scanText(record, "quarantine"));

  const compliance = evaluateCompliance({
    actor: "security-verification-membrane",
    action: "active hunt bad corrupted rotted unverified hostile leaked disinformation outside tampering data",
    country: "US",
    domains: ["security", "privacy", "ai_governance", "data_retention", "system_law"],
    containsExternalExport: false,
  });

  if (!compliance.allowed) {
    findings.push(finding({ threatClass: "system_failure_risk", severity: "high", source: "runtime", summary: "Compliance agent blocked part of the active hunt request.", recommendedAction: "owner_review", evidence: compliance }));
  }

  return findings;
}

export function runSecurityReverificationCycle(): MembraneSnapshot {
  const findings = huntBadData();
  const critical = findings.filter((item) => item.severity === "critical").length;
  const high = findings.filter((item) => item.severity === "high").length;
  const status: MembraneSnapshot["status"] = critical > 0 ? "red" : high > 0 ? "yellow" : "green";
  const base = {
    at: new Date().toISOString(),
    status,
    doctrine: CODE_OF_CONDUCT,
    noTouchZones: NO_TOUCH_ZONES,
    findings,
  };
  const snapshot = { ...base, hash: sha256(base) };

  appendSecurityEvent({
    severity: status === "red" ? "critical" : status === "yellow" ? "warn" : "info",
    event: "SECURITY_REVERIFICATION_CYCLE",
    actor: "security-verification-membrane",
    details: { status, findings: findings.length, critical, high, hash: snapshot.hash },
  });

  return snapshot;
}

export function getMeshSkullPolicy() {
  return {
    name: "Mesh Skull Protective Membrane",
    purpose: "Encases brain, braid, spine, memory, mesh, and operator surfaces with active verification and no-touch protection.",
    brainNeeds: ["local LLM adapter", "mesh routing", "spine no-touch rules", "operator conduct", "quarantine gate", "reverification cycle"],
    noTouchZones: NO_TOUCH_ZONES,
    codeOfConduct: CODE_OF_CONDUCT,
    membraneRule: "Everything entering the braid is scanned, classified, verified, logged, and reverified before trust.",
  };
}
