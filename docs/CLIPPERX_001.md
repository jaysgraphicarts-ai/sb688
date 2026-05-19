# CLIPPERX-001 — Business Connector Clip Brick

**System:** SB688 / SB689  
**Brick ID:** `CLIPPERX-001`  
**Category:** Business connector, access routing, Memory Chip link, industry onboarding  
**Status:** Public-safe Clip Brick specification  

---

## Purpose

CLIPPERX-001 is the business connector brick.

It turns a public industry demo into a private business system by connecting:

```text
public industry page
  ↓
business intake
  ↓
access key / 32GB braided card
  ↓
STITCH handshake
  ↓
customer Memory Chip
  ↓
approved Clip Bricks
  ↓
AVA business room
```

---

## Core law

```text
No business enters the Hive Mind without a verified room, verified key, verified Memory Chip, and approved Clip Bricks.
```

---

## Module map

```json
{
  "brick_id": "CLIPPERX-001",
  "modules": {
    "industry_selector": {
      "job": "route public visitors to the correct industry demo",
      "examples": ["music", "restaurant", "barber", "printing", "merch", "contractor", "fitness"]
    },
    "business_room_creator": {
      "job": "prepare a separated business room after intake approval",
      "requires_owner_identity": true
    },
    "access_key_binder": {
      "job": "bind public card ID or login route to the approved business room",
      "safe_rule": "store hashes or public IDs only; never raw secrets"
    },
    "memory_chip_linker": {
      "job": "connect business room to the customer Memory Chip record",
      "requires_stitch_handshake": true
    },
    "clip_brick_loader": {
      "job": "load only approved rented or owned Clip Bricks",
      "requires_access_state": ["LEASED_MONTHLY", "PAID_OUT"]
    },
    "ava_room_launcher": {
      "job": "open AVA business session after handshake passes",
      "requires_vera_boundary": true
    },
    "audit_ledger": {
      "job": "record room creation, key binding, chip linking, and session launch",
      "mode": "append_only"
    }
  }
}
```

---

## Operating flow

```text
VISITOR CHOOSES INDUSTRY
  ↓
PUBLIC DEMO LOADS
  ↓
BUSINESS INTAKE SUBMITTED
  ↓
CLIPPERX PREPARES BUSINESS ROOM
  ↓
OWNER IDENTITY CHECK
  ↓
ACCESS KEY / 32GB CARD BOUND
  ↓
MEMORY CHIP LINKED
  ↓
APPROVED CLIP BRICKS ATTACHED
  ↓
STITCH HANDSHAKE REQUIRED
  ↓
AVA ROOM OPENS
  ↓
LEDGER RECORDS THE SESSION
```

---

## 32GB card role

A 32GB card can serve as the customer's physical access packet.

It may hold:

- public card ID
- QR login route
- industry demo packet
- onboarding files
- brand/media files
- encrypted exports
- public documentation

It should not hold unprotected:

- raw passwords
- service role keys
- unencrypted Memory Chip contents
- full customer database
- payment secrets

Safe model:

```text
32GB CARD = physical key + portable packet
SUPABASE = secure backend
MEMORY CHIP = private business memory record
STITCH = handshake
CLIPPERX = connection/binding engine
AVA = business operator
```

---

## States

| State | Meaning |
|---|---|
| `DEMO` | Public demo only; no private memory loaded. |
| `INTAKE_PENDING` | Business submitted info but room not approved. |
| `ROOM_READY` | Business room exists. |
| `KEY_BOUND` | Access key/card is connected to the business room. |
| `CHIP_LINKED` | Memory Chip record is attached. |
| `BRICKS_ATTACHED` | Approved Clip Bricks are connected. |
| `HANDSHAKE_REQUIRED` | Login/card scan must pass STITCH check. |
| `LIVE_ROOM` | AVA can operate inside the approved room. |
| `DENIED` | Access failed or is not approved. |

---

## Public/private boundary

Safe to publish publicly:

- industry demo flow
- onboarding structure
- card usage explanation
- module names
- public claim boundary
- business value proposition

Do not publish publicly:

- real access tokens
- raw card secrets
- private customer Memory Chip contents
- live client records
- service role keys
- private ledger records

---

## Honest claim boundary

CLIPPERX-001 is a connector brick for software onboarding, access routing, Memory Chip linking, approved Clip Brick loading, and ledgered session launch.

It does not magically secure data by itself. Security requires authentication, RLS, backend verification, encryption where needed, and correct operational policies.

Public claim:

> CLIPPERX-001 clips a business into the JGA Hive Mind by connecting its industry demo, access key, Memory Chip, approved Clip Bricks, AVA room, and ledgered STITCH handshake.
