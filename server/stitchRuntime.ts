import crypto from "crypto";

export type TopologySystem = {
  id: string;
  name: string;
  role: string;
  status: "online" | "syncing" | "sealed" | "watching";
  braid: string[];
};

export type MemoryCard = {
  id: string;
  issuedAt: string;
  owner: "JGA";
  protocol: "SB688_PUBLIC_STITCH";
  mobileLink: string;
  payload: string;
  checksum: string;
};

const topology: TopologySystem[] = [
  {
    id: "perinatal-qubic-braid",
    name: "Perinatal Qubic Braid",
    role: "genesis layer",
    status: "online",
    braid: ["seed", "ghost", "armor", "crown"],
  },
  {
    id: "membrane-wall",
    name: "Membrane Wall",
    role: "public boundary and signal filter",
    status: "sealed",
    braid: ["signal", "silence-coat", "verification"],
  },
  {
    id: "spine-proxy",
    name: "Spine Proxy",
    role: "verified relay only",
    status: "watching",
    braid: ["governance", "relay", "audit"],
  },
  {
    id: "hive-mind",
    name: "Hive Mind",
    role: "distributed command memory and shared state",
    status: "syncing",
    braid: ["runtime", "memory-card", "mobile-link"],
  },
];

const bootTime = new Date().toISOString();

export function getHiveSnapshot(origin = "http://localhost:3000") {
  const heartbeat = 72;
  const drift = Number((0.0003 + Math.random() * 0.0002).toFixed(4));
  const ledgerHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ bootTime, topology, heartbeat, drift }))
    .digest("hex");

  return {
    protocol: "SB688_PUBLIC_STITCH",
    owner: "JGA",
    runtime: "sb688-public",
    version: "1.1.1",
    status: "CONNECTED",
    bootTime,
    heartbeatBpm: heartbeat,
    drift,
    topology,
    endpoints: {
      snapshot: `${origin}/api/stitch/snapshot`,
      memoryCard: `${origin}/api/stitch/memory-card`,
      mobileLink: `${origin}/api/stitch/mobile-link`,
      events: `${origin}/api/stitch/events`,
    },
    ledger: [
      {
        id: "ledger-001",
        event: "CONNECT_STITCH",
        timestamp: bootTime,
        hash: `sha256:${ledgerHash}`,
        prevHash: "genesis",
      },
    ],
  };
}

export function buildMemoryCard(origin = "http://localhost:3000"): MemoryCard {
  const snapshot = getHiveSnapshot(origin);
  const payload = Buffer.from(JSON.stringify(snapshot)).toString("base64url");
  const checksum = crypto.createHash("sha256").update(payload).digest("hex");

  return {
    id: "sb688-memory-card-001",
    issuedAt: new Date().toISOString(),
    owner: "JGA",
    protocol: "SB688_PUBLIC_STITCH",
    mobileLink: `${origin}/?stitch=${payload}`,
    payload,
    checksum,
  };
}

export function decodeMemoryCard(payload: string) {
  const decoded = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(decoded);
}

export function getHandshakeLines() {
  return [
    "Outside Signal -> sb688 public repo",
    "Silence Coat -> filtered noise",
    "Membrane Wall -> public boundary sealed",
    "Braid Layer -> dependency noise contained",
    "Hive Mind -> memory card minted",
    "Mobile Link -> encoded connection established",
    "Ledger -> hash appended",
  ];
}
