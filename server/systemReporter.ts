import { appendSecurityEvent, verifySecurityLedger } from "./stitchSecurity";
import { assertSovereignBootReady, getSovereignRuntimePolicy } from "./sovereignRuntime";
import { exportVaultSnapshot, verifyVault } from "./sovereignVault";
import { loadDefaultClipBricks, listClipBricks } from "./clipBricks";

export type SystemReport = {
  at: string;
  status: "green" | "yellow" | "red";
  summary: string;
  checks: Record<string, unknown>;
  textLineMessage: string;
};

function now() {
  return new Date().toISOString();
}

export function buildSystemReport(): SystemReport {
  loadDefaultClipBricks();
  const boot = assertSovereignBootReady();
  const vault = verifyVault("memory");
  const quarantine = verifyVault("quarantine");
  const security = verifySecurityLedger();
  const bricks = listClipBricks();
  const policy = getSovereignRuntimePolicy();
  const snapshot = exportVaultSnapshot();

  const failures = [
    !boot.ok && "sovereign_boot",
    !(vault as any).ok && "vault_chain",
    !(quarantine as any).ok && "quarantine_chain",
    !(security as any).ok && "security_ledger",
  ].filter(Boolean);

  const status: SystemReport["status"] = failures.length === 0 ? "green" : failures.length <= 2 ? "yellow" : "red";
  const summary = failures.length === 0 ? "Stitch sovereign checks passed." : `Stitch attention needed: ${failures.join(", ")}`;
  const textLineMessage = `[STITCH ${status.toUpperCase()}] ${summary} boot=${boot.ok} vault=${(vault as any).ok} quarantine=${(quarantine as any).ok} security=${(security as any).ok} bricks=${bricks.length} snapshot=${snapshot.checksum.slice(0, 12)}`;

  appendSecurityEvent({
    severity: status === "green" ? "info" : status === "yellow" ? "warn" : "critical",
    event: "SYSTEM_REPORT_BUILT",
    actor: "system",
    details: { status, failures, snapshot: snapshot.checksum },
  });

  return {
    at: now(),
    status,
    summary,
    checks: { boot, vault, quarantine, security, bricks, adapters: policy.adapters },
    textLineMessage,
  };
}

export function getTextNotificationPlan() {
  return {
    mode: "sovereign_first",
    intervalHours: 3,
    primary: "local_owner_console_and_local_device_alert",
    optionalAdapters: ["email_gateway", "self_hosted_sms_modem", "paid_sms_provider_disabled_by_default"],
    rule: "Reports are generated locally every three hours. Text delivery requires either a local modem/phone bridge or an optional external adapter; the system must not depend on a paid API to function.",
  };
}
