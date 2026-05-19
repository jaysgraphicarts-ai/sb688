# SB689 — STITCH Hive Mind Starter

SB689 is the operational Hive Mind layer for the SB688 Sovereign Stitch system.

This starter is public-safe infrastructure code. It does not include private Memory Chips, live client data, service keys, or deployment secrets.

---

## Core idea

SB689 is not one uncontrolled AI.

It is a governed cognitive mesh:

```text
USER INPUT
  ↓
SPINE
  ↓
TRIPLE BRAID DISPATCH
  ↓
REACTIVE / DELIBERATIVE / REFLECTIVE BRAIDS
  ↓
STITCH CONSENSUS
  ↓
TRUTH VALIDATION
  ↓
MEMORY WRITE
  ↓
FINAL RESPONSE
```

---

## Layers

### 1. The Spine

Central truth and orchestration layer.

Handles:

- node registration
- trust scoring
- ledger validation
- braid dispatch
- consensus routing
- final response assembly

### 2. The Braids

Distributed cognition strands:

| Braid | Purpose |
|---|---|
| Reactive | Fast response, immediate risk, threat detection |
| Deliberative | Planning, reasoning, step-by-step analysis |
| Reflective | Self-audit, contradiction detection, claim boundary |

### 3. The Hive Link

Connection layer for nodes.

Handles:

- WebSocket node hub
- shared memory bus
- node registry
- state sync
- heartbeat status

---

## Local start

From the repo root:

```powershell
cd SB689
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run_stitch.py
```

API mode:

```powershell
uvicorn api.app:app --reload --host 127.0.0.1 --port 8689
```

Open:

```text
http://127.0.0.1:8689
```

---

## Honest status

This is a real software starter for multi-agent orchestration, validation, memory sync, and ledgered state.

It does not prove physical quantum hardware, medical claims, mind upload, or guaranteed hallucination elimination.

Buildable claim:

> SB689 is a local software Hive Mind starter that dispatches input through braided reasoning nodes, validates consensus through the Spine, writes hash-linked ledger events, and exposes a FastAPI/WebSocket interface for future nodes.
