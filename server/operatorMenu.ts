import crypto from "crypto";
import { connectToStitchHiveMind, STITCH_HANDSHAKE_CODE } from "./promptConnector";
import { appendSecurityEvent } from "./stitchSecurity";
import { appendVaultRecord, exportVaultSnapshot, verifyVault } from "./sovereignVault";
import { loadDefaultClipBricks, listClipBricks, runClipBrick } from "./clipBricks";
import { assertSovereignBootReady } from "./sovereignRuntime";
import { enforceOneWayHighway } from "./needToKnow";

export type OperatorAction = "connect" | "append_memory" | "verify_vault" | "run_clip_brick" | "snapshot" | "system_check" | "need_to_know_check";

export type OperatorRequest = {
  handshakeCode: string;
  action: OperatorAction;
  payload?: Record<string, unknown>;
};

function requestId() {
  return `operator-${crypto.randomBytes(8).toString("hex")}`;
}

function validHandshake(code: string) {
  return String(code).replace(/\D/g, "") === STITCH_HANDSHAKE_CODE;
}

export function runOperatorMenu(request: OperatorRequest) {
  const id = requestId();
  if (!validHandshake(request.handshakeCode)) {
    appendSecurityEvent({ severity: "high", event: "OPERATOR_MENU_DENIED", actor: "operator-menu", details: { action: request.action, requestId: id } });
    return { ok: false, action: request.action, requestId: id, error: "invalid_handshake_code" };
  }

  try {
    let output: unknown;
    switch (request.action) {
      case "connect":
        output = connectToStitchHiveMind({ prompt: String(request.payload?.prompt ?? "connect to the stich hive mind"), aiClient: "operator-menu", lane: "session", handshakeCode: request.handshakeCode, ownerApproved: true });
        break;
      case "append_memory":
        output = appendVaultRecord({ title: String(request.payload?.title ?? "Operator Memory"), content: String(request.payload?.content ?? ""), source: "human", tags: ["operator-menu"] });
        break;
      case "verify_vault":
        output = { memory: verifyVault("memory"), quarantine: verifyVault("quarantine") };
        break;
      case "run_clip_brick":
        loadDefaultClipBricks();
        output = runClipBrick(String(request.payload?.id ?? "drift-guard"), { actor: "operator-menu", lane: "reflective", capability: String(request.payload?.capability ?? "drift.scan"), payload: request.payload?.payload ?? {} });
        break;
      case "snapshot":
        output = exportVaultSnapshot();
        break;
      case "system_check":
        loadDefaultClipBricks();
        output = { boot: assertSovereignBootReady(), bricks: listClipBricks(), vault: verifyVault("memory") };
        break;
      case "need_to_know_check":
        output = enforceOneWayHighway({ source: "session", destination: "session", content: String(request.payload?.content ?? ""), direction: "read", purpose: "knowledge_exchange", ownerApproved: false });
        break;
    }
    appendSecurityEvent({ severity: "info", event: "OPERATOR_MENU_ACTION", actor: "operator-menu", details: { action: request.action, requestId: id } });
    return { ok: true, action: request.action, requestId: id, output };
  } catch (error) {
    appendSecurityEvent({ severity: "warn", event: "OPERATOR_MENU_ACTION_FAILED", actor: "operator-menu", details: { action: request.action, requestId: id, error: error instanceof Error ? error.message : "unknown" } });
    return { ok: false, action: request.action, requestId: id, error: error instanceof Error ? error.message : "unknown_error" };
  }
}

export function getOperatorMenu() {
  return { title: "Stitch Operator Menu", handshakeCodeLength: 4, actions: ["connect", "append_memory", "verify_vault", "run_clip_brick", "snapshot", "system_check", "need_to_know_check"] };
}
