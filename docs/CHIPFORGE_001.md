# CHIPFORGE-001 — Microchip Rewrite + Program Clip Brick

**System:** SB688 / SB689  
**Brick ID:** `CHIPFORGE-001`  
**Category:** Microchip programming, 32GB card packet builder, access-key provisioning, Memory Chip update control  
**Status:** Public-safe Clip Brick specification  

---

## Purpose

CHIPFORGE-001 is the microchip rewrite and programming brick.

It prepares, rewrites, verifies, and seals the customer’s physical 32GB braided card / microchip packet so it can act as a safe access object for the SB688 business system.

It does **not** put raw secrets on the card. The safe design is:

```text
32GB CARD / MICROCHIP = physical access packet + public card ID + QR route + encrypted exports
SUPABASE BACKEND = secure truth source
MEMORY CHIP RECORD = private business memory container
STITCH = handshake verifier
CLIPPERX = room connector
AVA = business operator after verified access
```

---

## Core law

```text
No card rewrite becomes trusted until it is programmed, verified, hash-sealed, ledgered, and bound to the correct business room.
```

---

## Module map

```json
{
  "brick_id": "CHIPFORGE-001",
  "modules": {
    "card_identity_writer": {
      "job": "write public card ID, business route, and non-secret metadata",
      "never_write": ["raw password", "service role key", "private Memory Chip contents"]
    },
    "packet_builder": {
      "job": "build public demo packet, onboarding packet, brand kit, and encrypted exports",
      "supports": ["industry demo", "business docs", "media files", "QR route", "readme"]
    },
    "memory_chip_binder": {
      "job": "bind card ID to backend Memory Chip record through CLIPPERX",
      "requires_backend_record": true
    },
    "rewrite_guard": {
      "job": "prevent unsafe overwrite, wrong-owner rewrite, and unverified card reuse",
      "requires_owner_approval": true
    },
    "hash_sealer": {
      "job": "hash card manifest and packet manifest before/after rewrite",
      "algorithm": "SHA256"
    },
    "programming_ledger": {
      "job": "record program, rewrite, verify, bind, revoke, and restore events",
      "mode": "append_only"
    },
    "restore_checkpoint": {
      "job": "create restore manifest so a lost or corrupted card can be rebuilt safely",
      "requires_new_card_binding": true
    }
  }
}
```

---

## Operating flow

```text
BUSINESS ROOM APPROVED
  ↓
CHIPFORGE CREATES CARD MANIFEST
  ↓
PUBLIC CARD ID GENERATED
  ↓
QR / LOGIN ROUTE WRITTEN
  ↓
PUBLIC DEMO + BUSINESS PACKET WRITTEN
  ↓
OPTIONAL ENCRYPTED EXPORTS WRITTEN
  ↓
CARD MANIFEST HASHED
  ↓
CARD ID BINDS TO MEMORY CHIP RECORD
  ↓
STITCH HANDSHAKE TEST
  ↓
LEDGER RECORD
  ↓
CARD READY
```

---

## Rewrite flow

```text
REWRITE REQUEST
  ↓
OWNER APPROVAL CHECK
  ↓
CURRENT CARD HASH CHECK
  ↓
OLD CARD STATE MARKED SUPERSEDED OR REVOKED
  ↓
NEW PACKET BUILT
  ↓
NEW HASH GENERATED
  ↓
BACKEND BINDING UPDATED
  ↓
STITCH HANDSHAKE RETESTED
  ↓
LEDGER RECORD
```

---

## Card contents

Safe to write to card:

- public card ID
- QR login route
- public demo packet
- industry demo page shortcut
- onboarding forms
- brand/media kit
- approved exported files
- encrypted business packet
- card README
- card manifest JSON
- restore instructions without secrets

Do not write unprotected:

- Supabase service role key
- raw password
- private API keys
- raw access token
- full private Memory Chip contents
- payment secrets
- unencrypted client database
- private ledger exports

---

## States

| State | Meaning |
|---|---|
| `UNPROGRAMMED` | Blank or untrusted card. |
| `MANIFEST_CREATED` | Card manifest generated. |
| `PACKET_WRITTEN` | Public/demo/encrypted packet written. |
| `HASH_SEALED` | Card packet hash created. |
| `BOUND_TO_MEMORY_CHIP` | Card ID linked to backend Memory Chip record. |
| `HANDSHAKE_TESTED` | STITCH handshake test passed. |
| `READY` | Card is ready to issue. |
| `REWRITE_REQUIRED` | Card packet must be updated. |
| `REVOKED` | Card must not open the room. |
| `RESTORE_READY` | Restore manifest available for replacement card. |

---

## Public/private boundary

Safe to publish publicly:

- card programming workflow
- safety rules
- manifest format without secrets
- demo-packet structure
- rewrite/revoke/restore states

Do not publish publicly:

- real card secrets
- raw authentication tokens
- private Memory Chip contents
- live customer data
- private card manifests with identifying records
- service keys

---

## Honest claim boundary

CHIPFORGE-001 is a software-controlled card packet and access-binding brick.

It can prepare a 32GB card as a physical access object and portable business packet, but the card alone is not the secure backend. Real access must be verified through authentication, backend records, STITCH handshake, CLIPPERX binding, and ledger rules.

Public claim:

> CHIPFORGE-001 programs and rewrites SB688 32GB braided cards by building safe card packets, hash-sealing manifests, binding public card IDs to backend Memory Chip records, and recording every program/rewrite event into the ledger.
