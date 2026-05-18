import crypto from "crypto";
import { assertSovereignBootReady, getSovereignRuntimePolicy } from "./sovereignRuntime";
import { exportVaultSnapshot, verifyVault } from "./sovereignVault";
import { loadDefaultClipBricks, listClipBricks } from "./clipBricks";
import { listSecurityEvents, verifySecurityLedger, appendSecurityEvent } from "./stitchSecurity";
import { getOperatorMenu } from "./operatorMenu";
import { getUniversalPromptCard } from "./promptConnector";

export type IntegrityLevel = "green" | "yellow" | "red";

export type IntegrityPattern = {
  id: string;
  name: string;
  required: boolean;
  ok: boolean;
  detail: string;
};

function hash(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function buildIntegrityPatterns(): IntegrityPattern[] {
  loadDefaultClipBricks();
  const boot = assertSovereignBootReady();
  const vault = verifyVault("memory") as any;
  const quarantine = verifyVault("quarantine") as any;
  const security = verifySecurityLedger() as any;
  const bricks = listClipBricks();
  const policy = getSovereignRuntimePolicy();
  const prompt = getUniversalPromptCard();
  const menu = getOperatorMenu();

  return [
    { id: "sovereign_boot", name: "Offline sovereign boot", required: true, ok: Boolean(boot.ok), detail: boot.ok ? "Core can boot without paid APIs." : `Missing: ${boot.missing.join(", ")}` },
    { id: "vault_chain", name: "Trusted vault hash chain", required: true, ok: Boolean(vault.ok), detail: vault.ok ? `Memory head ${vault.head ?? "GENESIS"}` : vault.reason ?? "vault_failed" },
    { id: "quarantine_chain", name: "Quarantine hash chain", required: true, ok: Boolean(quarantine.ok), detail: quarantine.ok ? `Quarantine head ${quarantine.head ?? "GENESIS"}` : quarantine.reason ?? "quarantine_failed" },
    { id: "security_ledger", name: "Security ledger verification", required: true, ok: Boolean(security.ok), detail: security.ok ? "Security ledger verified." : security.reason ?? "security_failed" },
    { id: "clip_bricks", name: "Modular clip bricks loaded", required: true, ok: bricks.length >= 3, detail: `${bricks.length} clip bricks loaded.` },
    { id: "need_to_know", name: "Need-to-know doctrine active", required: true, ok: policy.principle.includes("without paid subscriptions") && policy.oneWayInternetRule.includes("quarantine"), detail: "One-way quarantine and no paid dependency policy present." },
    { id: "prompt_handshake", name: "Prompt handshake active", required: true, ok: prompt.acceptedSpellings.length >= 3, detail: "Prompt connector recognizes Stitch hive phrases." },
    { id: "operator_menu", name: "Operator action menu active", required: true, ok: menu.actions.length >= 7, detail: `${menu.actions.length} operator actions available.` },
  ];
}

export function buildIntegritySnapshot() {
  const patterns = buildIntegrityPatterns();
  const failedRequired = patterns.filter((pattern) => pattern.required && !pattern.ok);
  const level: IntegrityLevel = failedRequired.length === 0 ? "green" : failedRequired.length <= 2 ? "yellow" : "red";
  const snapshot = exportVaultSnapshot();
  const body = {
    at: new Date().toISOString(),
    level,
    principle: "Knowledge-shaped, data-protected, need-to-know, resilient AI data integrity system.",
    warning: "No software can honestly guarantee 100 percent reliability in every possible situation; this kernel reports proof gates and failures instead of pretending.",
    patterns,
    failedRequired,
    vaultChecksum: snapshot.checksum,
    securityEvents: listSecurityEvents().slice(-25),
  };
  return { ...body, integrityHash: hash(body) };
}

export function runIntegrityCycle() {
  const snapshot = buildIntegritySnapshot();
  appendSecurityEvent({
    severity: snapshot.level === "green" ? "info" : snapshot.level === "yellow" ? "warn" : "critical",
    event: "INTEGRITY_CYCLE",
    actor: "stitch-integrity-kernel",
    details: { level: snapshot.level, failedRequired: snapshot.failedRequired.map((item) => item.id), integrityHash: snapshot.integrityHash },
  });
  return snapshot;
}
