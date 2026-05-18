import crypto from "crypto";
import fs from "fs";
import path from "path";
import { appendSecurityEvent } from "./stitchSecurity";

export type RecoveryStatus = "submitted" | "quarantined" | "manual_review" | "approved" | "denied" | "reset_complete";

export type OwnerRecoveryRequest = {
  id: string;
  at: string;
  emailClaim?: string;
  nameClaim?: string;
  reason: "forgot_email" | "forgot_password" | "locked_out" | "no_email_code_available";
  idDocumentHash: string;
  idDocumentName?: string;
  status: RecoveryStatus;
  notes: string[];
};

function vaultDir() {
  return process.env.STITCH_VAULT_DIR ?? process.env.STITCH_VAULT_PATH ?? path.resolve(process.cwd(), ".stitch-vault");
}

function recoveryDir() {
  return path.join(vaultDir(), "owner-recovery");
}

function recoveryIndexPath() {
  return path.join(recoveryDir(), "requests.jsonl");
}

function sha256(value: string | Buffer) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function appendRequest(request: OwnerRecoveryRequest) {
  fs.mkdirSync(recoveryDir(), { recursive: true, mode: 0o700 });
  fs.appendFileSync(recoveryIndexPath(), JSON.stringify(request) + "\n", { mode: 0o600 });
}

export function submitOwnerIdRecovery(input: {
  emailClaim?: string;
  nameClaim?: string;
  idDocumentBytes: string;
  idDocumentName?: string;
  reason?: OwnerRecoveryRequest["reason"];
}) {
  const idDocumentHash = sha256(input.idDocumentBytes);
  const request: OwnerRecoveryRequest = {
    id: `owner-recovery-${crypto.randomBytes(8).toString("hex")}`,
    at: new Date().toISOString(),
    emailClaim: input.emailClaim,
    nameClaim: input.nameClaim,
    reason: input.reason ?? "locked_out",
    idDocumentHash,
    idDocumentName: input.idDocumentName,
    status: "quarantined",
    notes: [
      "ID document hash recorded; raw ID must remain quarantined and should not be committed to source control.",
      "No email reset code required. Manual owner verification required before passcode reset.",
    ],
  };

  appendRequest(request);
  appendSecurityEvent({
    severity: "critical",
    event: "OWNER_ID_RECOVERY_SUBMITTED",
    actor: "owner-id-recovery",
    details: { requestId: request.id, emailClaim: input.emailClaim, nameClaim: input.nameClaim, idDocumentHash, status: request.status },
  });

  return request;
}

export function listOwnerRecoveryRequests() {
  const file = recoveryIndexPath();
  if (!fs.existsSync(file)) return [] as OwnerRecoveryRequest[];
  return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as OwnerRecoveryRequest);
}

export function getOwnerRecoveryPolicy() {
  return {
    name: "Owner ID Recovery Policy",
    rule: "When locked out and no email code can be sent, recovery requires valid ID upload, quarantine, hash logging, and manual verification before reset.",
    allowedResetMethods: ["valid_id_manual_review"],
    blockedResetMethods: ["email_code_only", "plain_passcode_in_repo", "automatic_reset_without_review"],
    protectedDataRule: "Raw ID documents are sensitive personal data and must remain outside public repo commits.",
  };
}
