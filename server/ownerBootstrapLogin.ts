import crypto from "crypto";
import fs from "fs";
import path from "path";
import { appendSecurityEvent } from "./stitchSecurity";

export type OwnerBootstrapState = {
  bootstrapUsed: boolean;
  ownerPasscodeHash?: string;
  updatedAt: string;
};

export type OwnerLoginResult =
  | { ok: true; mode: "bootstrap_required_change"; message: string; owner: OwnerRecord }
  | { ok: true; mode: "owner_login"; message: string; owner: OwnerRecord; session: { issuedAt: string; expiresAt: string } }
  | { ok: false; error: string };

export type OwnerRecord = {
  email: string;
  fullName: string;
  organization: string;
  role: "owner";
  authorityLevel: "sovereign_owner";
  occupation: string;
};

const OWNER_EMAIL = "jgaos2026@gmail.com";
const OWNER_RECORD: OwnerRecord = {
  email: OWNER_EMAIL,
  fullName: "John E Arenz",
  organization: "JGA Enterprises",
  role: "owner",
  authorityLevel: "sovereign_owner",
  occupation: "Founder / Owner / Sovereign Stitch System Architect",
};

function vaultDir() {
  return process.env.STITCH_VAULT_DIR ?? process.env.STITCH_VAULT_PATH ?? path.resolve(process.cwd(), ".stitch-vault");
}

function bootstrapPath() {
  return path.join(vaultDir(), "owner-bootstrap.json");
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function readState(): OwnerBootstrapState {
  const file = bootstrapPath();
  if (!fs.existsSync(file)) return { bootstrapUsed: false, updatedAt: new Date().toISOString() };
  return JSON.parse(fs.readFileSync(file, "utf8")) as OwnerBootstrapState;
}

function writeState(state: OwnerBootstrapState) {
  fs.mkdirSync(vaultDir(), { recursive: true, mode: 0o700 });
  fs.writeFileSync(bootstrapPath(), JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2), { mode: 0o600 });
}

function configuredBootstrapHash() {
  return process.env.STITCH_OWNER_BOOTSTRAP_CODE_HASH ?? "";
}

function configuredOwnerHash() {
  return process.env.STITCH_OWNER_PASSCODE_HASH ?? "";
}

export function getOwnerBootstrapStatus() {
  const state = readState();
  return {
    owner: OWNER_RECORD,
    bootstrapUsed: state.bootstrapUsed,
    hasRuntimeOwnerPasscode: Boolean(state.ownerPasscodeHash || configuredOwnerHash()),
    bootstrapConfigured: Boolean(configuredBootstrapHash()),
  };
}

export function ownerLogin(input: { email?: string; passcode?: string; newPasscode?: string }): OwnerLoginResult {
  const emailOk = String(input.email ?? "").trim().toLowerCase() === OWNER_EMAIL;
  const suppliedHash = sha256(String(input.passcode ?? ""));
  const state = readState();

  if (!emailOk) {
    appendSecurityEvent({ severity: "critical", event: "OWNER_LOGIN_DENIED", actor: "owner-bootstrap-login", details: { reason: "email_mismatch", email: input.email } });
    return { ok: false, error: "owner_email_not_recognized" };
  }

  if (!state.bootstrapUsed) {
    const bootstrapHash = configuredBootstrapHash();
    const bootstrapOk = Boolean(bootstrapHash) && safeEqual(suppliedHash, bootstrapHash);
    if (!bootstrapOk) {
      appendSecurityEvent({ severity: "critical", event: "OWNER_BOOTSTRAP_DENIED", actor: "owner-bootstrap-login", details: { reason: "bootstrap_code_failed" } });
      return { ok: false, error: "bootstrap_code_failed" };
    }

    const nextPasscode = String(input.newPasscode ?? "");
    if (nextPasscode.length < 12) {
      appendSecurityEvent({ severity: "warn", event: "OWNER_BOOTSTRAP_REQUIRES_CHANGE", actor: "owner-bootstrap-login", details: { reason: "new_passcode_missing_or_too_short" } });
      return { ok: true, mode: "bootstrap_required_change", message: "Bootstrap accepted. Set a new permanent owner passcode of at least 12 characters. Bootstrap will then be disabled forever.", owner: OWNER_RECORD };
    }

    writeState({ bootstrapUsed: true, ownerPasscodeHash: sha256(nextPasscode), updatedAt: new Date().toISOString() });
    appendSecurityEvent({ severity: "info", event: "OWNER_BOOTSTRAP_CONSUMED", actor: "owner-bootstrap-login", details: { owner: OWNER_EMAIL, bootstrapDisabled: true } });
    return issueOwnerSession("bootstrap_changed");
  }

  const expectedHash = state.ownerPasscodeHash || configuredOwnerHash();
  const passOk = Boolean(expectedHash) && safeEqual(suppliedHash, expectedHash);
  if (!passOk) {
    appendSecurityEvent({ severity: "critical", event: "OWNER_LOGIN_DENIED", actor: "owner-bootstrap-login", details: { reason: "passcode_failed", owner: OWNER_EMAIL } });
    return { ok: false, error: "owner_passcode_failed" };
  }

  return issueOwnerSession("owner_login");
}

function issueOwnerSession(reason: string): OwnerLoginResult {
  const issuedAt = new Date();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  appendSecurityEvent({ severity: "info", event: "OWNER_LOGIN_VERIFIED", actor: "owner-bootstrap-login", details: { owner: OWNER_EMAIL, reason, expiresAt: expiresAt.toISOString() } });
  return {
    ok: true,
    mode: "owner_login",
    message: "Owner login verified.",
    owner: OWNER_RECORD,
    session: { issuedAt: issuedAt.toISOString(), expiresAt: expiresAt.toISOString() },
  };
}

export function ownerBootstrapSetupInstructions() {
  return {
    requiredEnv: ["STITCH_OWNER_BOOTSTRAP_CODE_HASH"],
    recommendedRuntimeVaultFile: bootstrapPath(),
    generateHashCommand: "node -e \"console.log(require('crypto').createHash('sha256').update(process.argv[1]).digest('hex'))\" 'FIRST_LOGIN_CODE_OR_NEW_PASSCODE'",
    rule: "First login uses bootstrap hash once, then forces a new permanent passcode and writes only the new hash to the local protected vault file.",
  };
}
