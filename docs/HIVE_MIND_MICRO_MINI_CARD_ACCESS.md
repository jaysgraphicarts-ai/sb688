# SB688 Hive Mind — Micro Mini Card Access Protocol

**Repository:** `jaysgraphicarts-ai/sb688`  
**System:** SB688 → SB689 Sovereign Stitch / Hive Mind  
**Owner:** JGA Enterprise / Jay's Graphic Arts  
**Visibility:** Public-safe activation doctrine  
**Status:** Activated as public architecture protocol  

---

## 1. Activation statement

The SB688/SB689 Hive Mind is activated as a public architecture protocol for 24-hour business access through a verified Business Micro Mini Card.

The public repository explains the access model. Live runtime code, client memory, card secrets, private ledgers, and issued Memory Chips stay private.

---

## 2. Core idea

```text
BUSINESS MICRO MINI CARD
  ↓
CARD HANDSHAKE
  ↓
STITCH KNOWLEDGE LINK
  ↓
MEMORY CHIP
  ↓
AVA BUSINESS OPERATOR
  ↓
CLIP BRICKS
  ↓
VERA CHECK
  ↓
LEDGER RECORD
```

The Business Micro Mini Card is the access object.

The STITCH is the knowledge link, memory router, and handshake layer.

The Memory Chip is the private business memory container.

AVA connects only after the handshake passes.

---

## 3. What the Business Micro Mini Card means

A Business Micro Mini Card is the business access key for SB688/SB689 LiveOps.

It can represent:

- a printed card
- a QR card
- an NFC card
- a digital pass
- a client portal link
- a business activation token
- a private onboarding key

The card does not need to hold all business memory. It only needs to point to the correct verified Memory Chip through the STITCH handshake.

Public-safe explanation:

```text
The card is the door.
The STITCH is the handshake.
The Memory Chip is the business memory.
AVA is the operator.
Clip Bricks are the tools.
VERA is the gatekeeper.
The ledger records the action.
```

---

## 4. The STITCH knowledge link

The STITCH is the connection layer between the card and the business memory.

It performs four jobs:

1. **Identify** — reads the card or access request.
2. **Match** — finds the correct business Memory Chip.
3. **Verify** — checks access, lease, permissions, and risk.
4. **Connect** — allows AVA and approved Clip Bricks to operate.

The STITCH does not blindly trust the card.

It checks:

- card status
- business ID
- Memory Chip ID
- lease or paid-out authorization
- allowed Clip Bricks
- AVA permissions
- VERA rules
- ledger state

---

## 5. 24-hour access model

The Hive Mind is designed to support 24-hour access when connected to live private infrastructure.

Public protocol:

```text
24/7 ACCESS REQUEST
  ↓
CARD PRESENTED
  ↓
STITCH HANDSHAKE
  ↓
MEMORY CHIP FOUND
  ↓
VERA AUTH CHECK
  ↓
AVA SESSION STARTED
  ↓
BUSINESS BRICKS LOADED
```

Important boundary:

This public repository activates the architecture and access protocol. True 24/7 runtime requires private hosting, database, authentication, monitoring, and deployment infrastructure.

---

## 6. Handshake rules

A Hive Mind card handshake passes only when:

```text
1. Card exists.
2. Card is active.
3. Card maps to one business.
4. Business has a valid Memory Chip.
5. Memory Chip is active, leased, or paid out.
6. Requested Clip Bricks are approved.
7. AVA permission is enabled.
8. VERA check passes.
9. Ledger records the session.
```

If any rule fails, the system stays in demo, denied, expired, or quarantine mode.

---

## 7. Access states

| State | Meaning |
|---|---|
| `DEMO` | Public preview only. No live memory. |
| `CARD_PRESENTED` | Card was scanned or entered. |
| `HANDSHAKE_PENDING` | STITCH is verifying access. |
| `LIVE_SESSION` | AVA and approved bricks are active. |
| `READ_ONLY` | Lease expired or archive mode. |
| `DENIED` | Card or chip is invalid. |
| `QUARANTINED` | Risk, corruption, or security issue. |

---

## 8. Micro Mini Card public payload

A public-safe card should only expose non-sensitive routing information.

Example public payload:

```json
{
  "card_type": "JGA_BUSINESS_MICRO_MINI_CARD",
  "public_card_id": "CARD_PUBLIC_EXAMPLE",
  "system": "SB688/SB689",
  "access_url": "https://example.com/access",
  "mode": "HANDSHAKE_REQUIRED"
}
```

Do not place private Memory Chip contents, API keys, secrets, or client data on a public card.

---

## 9. Private handshake payload

The private runtime can map the card to protected server-side records.

Private records should stay outside the public repo.

Private fields may include:

- internal card ID
- hashed token
- business ID
- Memory Chip ID
- owner ID
- lease status
- approved Clip Bricks
- AVA permissions
- ledger head
- risk state

---

## 10. Hive Mind business session

Once the card handshake passes, the business session can load:

- business profile
- brand memory
- offers
- pricing
- customer context
- sales scripts
- service workflow
- support rules
- approved Clip Bricks
- AVA session rules

This is the point where the public demo becomes a private business system.

---

## 11. Multiple business support

The Hive Mind can support multiple businesses by assigning each business its own card and Memory Chip.

```text
Business A Card → STITCH → Memory Chip A → AVA A → Bricks A
Business B Card → STITCH → Memory Chip B → AVA B → Bricks B
Artist C Card   → STITCH → Memory Chip C → AVA C → Bricks C
```

The businesses share the SB688/SB689 architecture, but they do not share private memory.

---

## 12. Security boundary

Never store the following in the public repository:

- live card secrets
- unhashed access tokens
- Memory Chip contents
- client private memory
- customer records
- payment records
- API keys
- Supabase service role keys
- private ledgers
- unredacted business configs

Public repo contains doctrine, architecture, and sales-safe explanation only.

---

## 13. Future path

### Phase 1 — Public protocol

Explain Micro Mini Card access, STITCH handshake, Memory Chip connection, AVA session, and ClipBrick activation.

### Phase 2 — Private backend

Build private infrastructure for:

- authentication
- card lookup
- Memory Chip lookup
- VERA checks
- AVA session generation
- ledger writes
- monitoring

### Phase 3 — Business cards

Issue QR/NFC/digital business cards that route into the STITCH handshake.

### Phase 4 — 24-hour LiveOps

Deploy always-on private hosting with health checks, backups, logging, and access monitoring.

### Phase 5 — Verified Hive expansion

Allow many businesses to operate through separate Memory Chips while sharing the same verified SB688/SB689 architecture.

---

## 14. Official public pitch

```text
SB688/SB689 activates the Hive Mind through a Business Micro Mini Card.

The card does not expose the business memory.
It starts the handshake.

The STITCH verifies the card, links the correct Memory Chip, connects AVA, loads approved Clip Bricks, checks through VERA, and records the session to the ledger.

That gives each business a private AI memory operation that can be accessed anytime once live private infrastructure is deployed.
```

---

## 15. Honest claim boundary

Activated here means the public architecture protocol is official in the SB688 public repository.

It does not mean live production hosting is already running.

Live 24-hour access requires private deployment, authentication, database, monitoring, and secure card issuance.

Public claim:

> SB688 defines a Hive Mind access architecture where a Business Micro Mini Card initiates a STITCH handshake to connect a private Memory Chip, AVA operator, approved Clip Bricks, VERA checks, and ledgered business access.
