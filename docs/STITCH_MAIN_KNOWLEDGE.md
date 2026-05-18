# Stitch Main Knowledge Registry

This document defines the protected knowledge map for the Stitch runtime. It is a registry, not a full disclosure archive. Sensitive source material, phone numbers, private business records, passcodes, client details, proprietary implementation details, and unpublished IP should remain outside the public repository unless intentionally sanitized.

## Owner / Orchestrator

- Owner: John E. Arenz
- Business: Jays Graphic Arts / JGA Enterprises
- Runtime family: Stitch Brick 01, SB688, SB689, SB690v3, SB699
- Governance model: Braided Topology, Phoenix Restore, No-Trust Ledger, Pocket Memory, AVA orchestration

## Main Knowledge Domains

### 1. Stitch Brick 01
Canonical architecture for modular BRIC-style infrastructure.

Core knowledge:
- Spine layer coordinates routing and system laws.
- Operational layer executes application logic.
- Data Vault layer isolates persistent BRIC storage modules.
- Signal Routing layer uses Stitch signaling.
- Braided Redundancy Topology provides alternate paths when nodes fail.
- Self-healing isolates corrupted nodes, restores trusted checkpoints, validates integrity, and reconnects.

### 2. SB688
Control-plane runtime model.

Core knowledge:
- passcode-gated operator console
- modular clip-brick graph
- active and cold stitch links
- live failover routes
- per-brick trust seals
- chained ledger
- integrity scans
- quarantine lane
- last-known-good rehealing
- local browser UI synced to backend

### 3. SB689
Hive Mind and Pocket Memory layer.

Core knowledge:
- prompt-linked authorization
- one-hour owner-approved sessions
- tiered capability levels
- memory upload/download protocol
- portable encoded memory cards
- authorization ledger
- mobile relay readiness

### 4. SB690v3
Advanced runtime planning layer.

Core knowledge:
- modular evolution of SB688/SB689
- higher-order runtime braid mapping
- expanded synchronization model
- stronger verification gates
- enterprise-ready controls

### 5. SB699
Supervisor / guardian layer.

Core knowledge:
- higher-level runtime oversight
- drift alarms
- policy enforcement
- session revocation
- capability containment
- emergency lock controls

### 6. AVA Next Gen AI
AI orchestration interface.

AVA may:
- interpret runtime state
- summarize knowledge records
- propose code changes
- assist business workflows
- classify drift and uncertainty
- operate only inside approved tier limits

AVA must not:
- claim hidden access
- bypass owner approval
- expose secrets
- mutate protected records without authorization
- represent simulated state as verified state

### 7. JGA Business Cycle Knowledge
Jays Graphic Arts / JGA Enterprises operational knowledge includes:
- sales intake
- quote generation
- signed authorization
- deposit gate
- design production
- revision cycle
- owner approval
- final payment
- tax/compliance verification
- secure delivery
- audit record

Business-cycle knowledge must be stored as sanitized operational patterns unless deployed in a private encrypted vault.

### 8. Braided Topology
All work should be converted into braided topology records:

```txt
Seed -> canonical source
Ghost -> mirror/replay copy
Armor -> security and self-heal layer
Crown -> UI/operator view
Ledger -> append-only audit
Spine -> policy/routing layer
Phoenix -> restore path
```

### 9. 1211 Code
The 1211 code is treated as a legacy/dev access symbol and must not be used as a production secret.

Production rule:
- never hardcode passcodes
- use environment variables
- rotate secrets
- require owner approval
- log all access attempts

### 10. Mini Chip / Mobile Memory Card
The 32GB mini chip card concept maps to portable encrypted runtime storage.

Allowed storage:
- encrypted memory exports
- signed runtime snapshots
- public config bundles
- mobile pairing tokens
- ledger archives

Disallowed storage:
- unencrypted secrets
- raw phone numbers
- private keys
- personal financial data
- client confidential data

### 11. Nero Link
Nero Link is the secure relay bridge.

Responsibilities:
- mobile session relay
- encrypted memory transfer
- owner approval prompt routing
- drift event reporting
- capability-tier enforcement

### 12. Electric Extension Layer
Electric Extension means edge-device expansion.

Possible devices:
- phone
- laptop
- USB / microSD storage
- Raspberry Pi
- ESP32
- local server
- edge AI device

All devices must be treated as untrusted until verified.

## Knowledge Classification

Every knowledge item receives one classification:

```txt
PUBLIC_SAFE
PRIVATE_OWNER_ONLY
CONFIDENTIAL_IP
SECRET_CREDENTIAL
CLIENT_CONFIDENTIAL
UNVERIFIED_IDEA
SIMULATED_STATE
VERIFIED_RUNTIME
```

## Drift / Hallucination Handling

Every generated claim must be classified as:

```txt
verified
inferred
estimated
unverified
simulated
```

Recovery path:

```txt
Detect Drift -> Freeze Output -> Compare Trusted Sources -> Restore Seed/Ghost Snapshot -> Ledger Event -> Resume
```

## Security Baseline

- no secrets in public repo
- no raw phone numbers in public repo
- no raw passcodes in public repo
- no unrestricted remote access
- no silent code mutation
- no invisible authorization
- owner approval required for elevated sessions
- all access is time-limited
- all capability grants are tiered
- all sensitive exports are encrypted
- all important events are ledgered

## Public Repo Rule

The public repo may contain:
- schemas
- sanitized architecture
- defensive security logic
- docs
- placeholders for env vars
- demo-safe examples

The public repo must not contain:
- private phone numbers
- passwords
- API keys
- private client records
- proprietary unpublished claims in full detail
- raw confidential uploads
- anything needed to impersonate the owner
