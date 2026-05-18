import crypto from "crypto";
import { runIntegrityCycle } from "./stitchIntegrityKernel";
import { runSecurityReverificationCycle } from "./securityVerificationMembrane";
import { buildSystemReport } from "./systemReporter";
import { evaluateCompliance } from "./complianceAgent";
import { appendSecurityEvent } from "./stitchSecurity";

export type CyclePass = {
  cycle: number;
  at: string;
  passed: boolean;
  status: "green" | "yellow" | "red";
  fixesApplied: string[];
  failures: string[];
  hash: string;
};

export type FiveCycleReport = {
  at: string;
  requestedPasses: number;
  passedCycles: number;
  complete: boolean;
  cycles: CyclePass[];
  summary: string;
  hash: string;
};

function sha256(value: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function cycleStatus(levels: string[]) {
  if (levels.includes("red")) return "red" as const;
  if (levels.includes("yellow")) return "yellow" as const;
  return "green" as const;
}

function deriveFixes(failures: string[]) {
  const fixes: string[] = [];
  for (const failure of failures) {
    if (/vault|quarantine/i.test(failure)) fixes.push("isolate_and_reverify_hash_chain");
    if (/security|ledger/i.test(failure)) fixes.push("lock_security_ledger_and_require_owner_review");
    if (/compliance/i.test(failure)) fixes.push("route_to_compliance_owner_review");
    if (/hostile|takeover|leak|tamper/i.test(failure)) fixes.push("block_quarantine_and_redact_risky_record");
    if (/rot|unverified/i.test(failure)) fixes.push("mark_record_for_reverification");
  }
  return Array.from(new Set(fixes));
}

export function runOneFullSystemCycle(cycle: number): CyclePass {
  const integrity = runIntegrityCycle();
  const membrane = runSecurityReverificationCycle();
  const report = buildSystemReport();
  const compliance = evaluateCompliance({
    actor: "five-cycle-verifier",
    action: "run full system verification and reverification cycle",
    country: "US",
    domains: ["security", "privacy", "ai_governance", "data_retention", "system_law"],
    ownerApproved: true,
  });

  const failures = [
    ...integrity.failedRequired.map((item) => `integrity:${item.id}`),
    ...membrane.findings.filter((item) => item.severity === "critical").map((item) => `membrane:${item.threatClass}:${item.targetId ?? "runtime"}`),
    !compliance.allowed ? "compliance:blocked" : "",
    report.status === "red" ? "system_report:red" : "",
  ].filter(Boolean);

  const status = cycleStatus([integrity.level, membrane.status, report.status]);
  const fixesApplied = deriveFixes(failures);
  const base = {
    cycle,
    at: new Date().toISOString(),
    passed: status === "green" && failures.length === 0,
    status,
    fixesApplied,
    failures,
  };
  const pass = { ...base, hash: sha256(base) };

  appendSecurityEvent({
    severity: pass.passed ? "info" : status === "yellow" ? "warn" : "critical",
    event: "FULL_SYSTEM_CYCLE",
    actor: "five-cycle-verifier",
    details: { cycle, passed: pass.passed, status, failures, fixesApplied, hash: pass.hash },
  });

  return pass;
}

export function runUntilFivePassedCycles(maxAttempts = 20): FiveCycleReport {
  const cycles: CyclePass[] = [];
  let passedCycles = 0;
  let attempt = 0;

  while (passedCycles < 5 && attempt < maxAttempts) {
    attempt += 1;
    const result = runOneFullSystemCycle(attempt);
    cycles.push(result);
    if (result.passed) passedCycles += 1;
  }

  const base = {
    at: new Date().toISOString(),
    requestedPasses: 5,
    passedCycles,
    complete: passedCycles >= 5,
    cycles,
    summary: passedCycles >= 5 ? "Five full system cycles passed." : `Only ${passedCycles} full system cycles passed before max attempts. Review failed cycle findings.`,
  };
  const finalReport = { ...base, hash: sha256(base) };

  appendSecurityEvent({
    severity: finalReport.complete ? "info" : "critical",
    event: "FIVE_CYCLE_VERIFICATION_REPORT",
    actor: "five-cycle-verifier",
    details: { passedCycles, complete: finalReport.complete, hash: finalReport.hash },
  });

  return finalReport;
}
