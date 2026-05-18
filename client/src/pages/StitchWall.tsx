import { useEffect, useMemo, useState } from "react";
import { Activity, Brain, Clock3, Database, ShieldCheck, Smartphone, Workflow } from "lucide-react";

const nodes = [
  { id: "seed", label: "Seed", role: "canonical truth", state: "verified" },
  { id: "ghost", label: "Ghost", role: "mirror + replay", state: "mirroring" },
  { id: "armor", label: "Armor", role: "self-heal", state: "healing" },
  { id: "crown", label: "Crown", role: "operator UI", state: "online" },
  { id: "ledger", label: "Ledger", role: "audit chain", state: "sealed" },
  { id: "spine", label: "Spine", role: "policy rail", state: "guarding" },
];

const tiers = [
  ["Observer", "read runtime, view topology"],
  ["Memory", "read/upload/export pocket memory"],
  ["Operator", "diagnostics + memory import"],
  ["Builder", "propose code + open PR"],
  ["Sovereign", "owner-gated admin override"],
];

export default function StitchWall() {
  const [seconds, setSeconds] = useState(3600);
  const [pulse, setPulse] = useState(72);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
      setPulse((value) => (value >= 74 ? 72 : value + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const timeLeft = useMemo(() => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [seconds]);

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="rounded-3xl border border-emerald-500/30 bg-zinc-950 p-6 shadow-2xl shadow-emerald-950/30">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">SB689 Stitch Wall</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Hive Mind Session Console</h1>
              <p className="mt-3 max-w-3xl text-zinc-300">
                Owner-governed memory exchange: handshake downloads pocket memory, the session runs for one hour,
                and closing uploads a new memory card back into the Stitch ledger.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <Clock3 className="mb-2 h-5 w-5 text-emerald-300" />
                <p className="text-zinc-400">Session</p>
                <p className="text-2xl font-bold">{timeLeft}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <Activity className="mb-2 h-5 w-5 text-emerald-300" />
                <p className="text-zinc-400">Pulse</p>
                <p className="text-2xl font-bold">{pulse} BPM</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Workflow className="h-6 w-6 text-emerald-300" />
              <h2 className="text-2xl font-bold">Braided Topology</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {nodes.map((node, index) => (
                <div key={node.id} className="rounded-2xl border border-emerald-500/20 bg-black p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Brick {index + 1}</p>
                  <h3 className="mt-2 text-xl font-bold">{node.label}</h3>
                  <p className="text-sm text-zinc-400">{node.role}</p>
                  <p className="mt-3 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">{node.state}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              <h2 className="text-2xl font-bold">Conduct Laws</h2>
            </div>
            <ol className="space-y-3 text-sm text-zinc-300">
              <li>No active state becomes trusted without verification.</li>
              <li>Unknowns must be labeled instead of hallucinated.</li>
              <li>Owner approval is required for elevated capability.</li>
              <li>Secrets stay outside the public repo.</li>
              <li>Every critical event appends to a ledger.</li>
            </ol>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Panel icon={<Database />} title="Pocket Memory">
            <p>Download at handshake. Upload at close. Chain-linked records preserve total recall without pretending omniscience.</p>
          </Panel>
          <Panel icon={<Smartphone />} title="Mobile Link">
            <p>Phone approval and memory cards use environment-configured secrets, never hardcoded public values.</p>
          </Panel>
          <Panel icon={<Brain />} title="Drift Guard">
            <p>Inputs and outputs are classified as verified, inferred, unverified, simulated, or quarantined before commit.</p>
          </Panel>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-5 text-2xl font-bold">Capability Tiers</h2>
          <div className="grid gap-3 md:grid-cols-5">
            {tiers.map(([name, desc]) => (
              <div key={name} className="rounded-2xl border border-zinc-800 bg-black p-4">
                <h3 className="font-bold text-emerald-200">{name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
        {icon}
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-zinc-300">{children}</div>
    </div>
  );
}
