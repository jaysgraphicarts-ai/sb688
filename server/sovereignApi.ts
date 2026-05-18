import type { Express, Request, Response } from "express";
import { appendVaultRecord, exportVaultSnapshot, importInternetQuarantine, promoteQuarantineRecord, readQuarantineRecords, readVaultRecords, verifyVault } from "./sovereignVault";
import { enforceOneWayHighway } from "./needToKnow";
import { assertSovereignBootReady, getSovereignRuntimePolicy } from "./sovereignRuntime";
import { loadDefaultClipBricks, listClipBricks, runClipBrick } from "./clipBricks";
import { appendSecurityEvent, listSecurityEvents, requireJsonBody, requireOwnerApiKey, securityHeaders, stitchRateLimit, verifySecurityLedger } from "./stitchSecurity";

export function installSovereignApi(app: Express) {
  app.use(securityHeaders);
  app.use(stitchRateLimit(120, 60_000));
  app.use(requireJsonBody);

  app.get("/api/stitch/sovereign/policy", (_req: Request, res: Response) => {
    res.json(getSovereignRuntimePolicy());
  });

  app.get("/api/stitch/sovereign/boot", (_req: Request, res: Response) => {
    res.json(assertSovereignBootReady());
  });

  app.get("/api/stitch/vault", requireOwnerApiKey, (_req: Request, res: Response) => {
    res.json({ records: readVaultRecords(), check: verifyVault("memory") });
  });

  app.post("/api/stitch/vault/append", requireOwnerApiKey, (req: Request, res: Response) => {
    const record = appendVaultRecord({
      title: String(req.body?.title ?? "Untitled Memory"),
      content: String(req.body?.content ?? ""),
      source: req.body?.source ?? "human",
      tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
    });
    appendSecurityEvent({ severity: "info", event: "VAULT_RECORD_APPENDED", actor: "owner", ip: req.ip, details: { id: record.id, classification: record.classification } });
    res.json({ record, check: verifyVault("memory") });
  });

  app.post("/api/stitch/quarantine/import", requireOwnerApiKey, (req: Request, res: Response) => {
    const record = importInternetQuarantine({
      title: String(req.body?.title ?? "Internet Quarantine Import"),
      content: String(req.body?.content ?? ""),
      tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
    });
    res.json({ record, quarantine: readQuarantineRecords(), check: verifyVault("quarantine") });
  });

  app.post("/api/stitch/quarantine/promote", requireOwnerApiKey, (req: Request, res: Response) => {
    const record = promoteQuarantineRecord(String(req.body?.id ?? ""), true);
    res.json({ record, check: verifyVault("memory") });
  });

  app.get("/api/stitch/snapshot", requireOwnerApiKey, (_req: Request, res: Response) => {
    res.json(exportVaultSnapshot());
  });

  app.post("/api/stitch/need-to-know", requireOwnerApiKey, (req: Request, res: Response) => {
    const decision = enforceOneWayHighway({
      source: req.body?.source ?? "session",
      destination: req.body?.destination ?? "session",
      content: String(req.body?.content ?? ""),
      direction: req.body?.direction ?? "read",
      purpose: req.body?.purpose ?? "knowledge_exchange",
      ownerApproved: Boolean(req.body?.ownerApproved),
    });
    res.json(decision);
  });

  app.get("/api/stitch/clip-bricks", (_req: Request, res: Response) => {
    loadDefaultClipBricks();
    res.json({ bricks: listClipBricks() });
  });

  app.post("/api/stitch/clip-bricks/run", requireOwnerApiKey, (req: Request, res: Response) => {
    loadDefaultClipBricks();
    const output = runClipBrick(String(req.body?.id ?? ""), {
      actor: "owner",
      lane: req.body?.lane ?? "reactive",
      capability: String(req.body?.capability ?? ""),
      payload: req.body?.payload,
      sessionId: req.body?.sessionId,
    });
    res.json(output);
  });

  app.get("/api/stitch/security", requireOwnerApiKey, (_req: Request, res: Response) => {
    res.json({ ledger: listSecurityEvents(), check: verifySecurityLedger() });
  });
}
