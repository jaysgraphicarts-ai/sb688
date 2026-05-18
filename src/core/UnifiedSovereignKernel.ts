import crypto from "node:crypto";

type BrickState = "READ_ONLY" | "MIRRORING" | "HEALING" | "ELEGANT" | "FAULT";
type Decision = "ACCEPT" | "REVISE" | "QUARANTINE" | "REJECT";

interface Brick {
  id: string;
  role: "SEED" | "GHOST" | "ARMOR" | "CROWN";
  state: BrickState;
  hash: string;
  verified: boolean;
}

interface LedgerEntry {
  id: string;
  timestamp: string;
  event: string;
  payloadHash: string;
  prevHash: string;
  hash: string;
}

interface SystemInput {
  message?: string;
  threatScore?: number;
  integrityScore?: number;
  recoveryRequested?: boolean;
  sourceConfidence?: number;
}

interface KernelResult {
  decision: Decision;
  health: number;
  verified: boolean;
  quantumProbabilities: Record<Decision, number>;
  bricks: Brick[];
  ledgerTip: string;
  notes: string[];
}

export class UnifiedSovereignKernel {
  private bricks: Brick[] = [];
  private ledger: LedgerEntry[] = [];

  constructor(private owner = "JGA", private protocol = "SB689_OMEGA") {
    this.boot();
  }

  private sha256(data: unknown): string {
    return crypto.createHash("sha256").update(typeof data === "string" ? data : JSON.stringify(data)).digest("hex");
  }

  private now(): string {
    return new Date().toISOString();
  }

  private appendLedger(event: string, payload: unknown): LedgerEntry {
    const prevHash = this.ledger.at(-1)?.hash ?? "genesis";
    const payloadHash = this.sha256(payload);
    const draft = {
      id: `entry-${String(this.ledger.length + 1).padStart(4, "0")}`,
      timestamp: this.now(),
      event,
      payloadHash,
      prevHash,
    };
    const entry: LedgerEntry = { ...draft, hash: this.sha256(draft) };
    this.ledger.push(entry);
    return entry;
  }

  private makeBrick(id: Brick["role"], state: BrickState): Brick {
    const base = { id, role: id, state, owner: this.owner, protocol: this.protocol };
    return { id, role: id, state, hash: this.sha256(base), verified: true };
  }

  boot(): void {
    this.bricks = [
      this.makeBrick("SEED", "READ_ONLY"),
      this.makeBrick("GHOST", "MIRRORING"),
      this.makeBrick("ARMOR", "HEALING"),
      this.makeBrick("CROWN", "ELEGANT"),
    ];
    this.appendLedger("BOOT_KERNEL", { owner: this.owner, protocol: this.protocol, bricks: this.bricks });
  }

  verifyLedger(): boolean {
    for (let i = 0; i < this.ledger.length; i++) {
      const entry = this.ledger[i];
      const expectedPrev = i === 0 ? "genesis" : this.ledger[i - 1].hash;
      if (entry.prevHash !== expectedPrev) return false;
      const recalculated = this.sha256({
        id: entry.id,
        timestamp: entry.timestamp,
        event: entry.event,
        payloadHash: entry.payloadHash,
        prevHash: entry.prevHash,
      });
      if (entry.hash !== recalculated) return false;
    }
    return true;
  }

  verifyBricks(): boolean {
    return this.bricks.every((brick) => brick.verified && brick.state !== "FAULT");
  }

  private truthNode(input: SystemInput): number {
    const source = input.sourceConfidence ?? 0.75;
    const threat = input.threatScore ?? 0;
    const integrity = input.integrityScore ?? 1;
    return Math.max(0, Math.min(1, source * 0.4 + integrity * 0.5 - threat * 0.3));
  }

  private phoenixNode(input: SystemInput): string[] {
    const notes: string[] = [];
    if (input.recoveryRequested || (input.integrityScore ?? 1) < 0.6) {
      const armor = this.bricks.find((brick) => brick.role === "ARMOR");
      if (armor) {
        armor.state = "HEALING";
        armor.hash = this.sha256({ role: armor.role, state: armor.state, restored: true });
        armor.verified = true;
      }
      notes.push("Phoenix recovery path activated.");
      this.appendLedger("PHOENIX_RECOVERY", input);
    }
    return notes;
  }

  private quantumStitch(truthScore: number, ledgerValid: boolean, bricksValid: boolean, input: SystemInput): Record<Decision, number> {
    const threat = input.threatScore ?? 0;
    const integrity = input.integrityScore ?? 1;
    const accept = truthScore * integrity;
    const revise = 1 - truthScore;
    const quarantine = threat + (ledgerValid ? 0 : 0.5) + (bricksValid ? 0 : 0.5);
    const reject = threat * (1 - integrity);
    const total = accept + revise + quarantine + reject || 1;
    return { ACCEPT: accept / total, REVISE: revise / total, QUARANTINE: quarantine / total, REJECT: reject / total };
  }

  private measure(probabilities: Record<Decision, number>): Decision {
    return Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0][0] as Decision;
  }

  process(input: SystemInput): KernelResult {
    const notes: string[] = [];
    notes.push(...this.phoenixNode(input));
    const ledgerValid = this.verifyLedger();
    const bricksValid = this.verifyBricks();
    const truthScore = this.truthNode(input);
    const probabilities = this.quantumStitch(truthScore, ledgerValid, bricksValid, input);
    const decision = this.measure(probabilities);
    const health = ((ledgerValid ? 1 : 0) + (bricksValid ? 1 : 0) + truthScore + (input.integrityScore ?? 1)) / 4;
    const entry = this.appendLedger("KERNEL_PROCESS", { input, truthScore, decision, probabilities, health });
    if (!ledgerValid) notes.push("Ledger verification failed.");
    if (!bricksValid) notes.push("Brick verification failed.");
    if (decision === "QUARANTINE") notes.push("System placed output into quarantine path.");
    if (decision === "ACCEPT") notes.push("Unified Stitch accepted the state.");
    return { decision, health, verified: ledgerValid && bricksValid, quantumProbabilities: probabilities, bricks: this.bricks, ledgerTip: entry.hash, notes };
  }
}

const isDirectRun = process.argv[1]?.endsWith("UnifiedSovereignKernel.js") || process.argv[1]?.endsWith("UnifiedSovereignKernel.ts");

if (isDirectRun) {
  const kernel = new UnifiedSovereignKernel();
  const result = kernel.process({
    message: "Run unified SB688/SB689 integrity cycle",
    threatScore: 0.12,
    integrityScore: 0.97,
    sourceConfidence: 0.9,
  });
  console.log(JSON.stringify(result, null, 2));
}
