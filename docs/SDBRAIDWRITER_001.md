# SDBRAIDWRITER-001 — MicroSD Braided Topology Rewriter + Downloader

**System:** SB688 / SB689  
**Brick ID:** `SDBRAIDWRITER-001`  
**Category:** MicroSD writer, braided topology packet layout, card downloader, manifest sealer  
**Status:** Public-safe Clip Brick specification  

---

## Purpose

SDBRAIDWRITER-001 rewrites a mounted microSD card into a safe SB688 braided topology file structure.

It does **not** physically change the silicon or hardware topology of the microSD card. It changes the card's software layout, folder structure, manifests, hash chain, access packet, demo packet, restore checkpoint, and verification records.

---

## Core law

```text
No microSD rewrite becomes trusted until the target path is verified, the packet is built, the manifest is hash-sealed, and the write is ledgered.
```

---

## Braided topology card layout

```text
SB688_CARD/
  00_READ_FIRST/
    README.txt
    OWNER_INSTRUCTIONS.txt
  01_ACCESS_KEY/
    public_card_id.txt
    qr_route.txt
    access_manifest.json
  02_STITCH_HANDSHAKE/
    stitch_route.json
    handshake_rules.json
  03_MEMORY_LINK/
    memory_chip_pointer.json
    no_raw_secrets.txt
  04_CLIP_BRICKS/
    approved_bricks.json
    public_demo_bricks/
  05_AVA_ROOM/
    ava_start_here.txt
    room_rules.json
  06_SHIELD/
    shield_rules.json
    blocked_items.txt
  07_CHIPFORGE/
    card_program_manifest.json
    rewrite_history.jsonl
  08_RESTORE/
    restore_manifest.json
    recovery_instructions.txt
  09_LEDGER/
    card_ledger.jsonl
    card_manifest.sha256
  10_EXPORTS/
    encrypted_exports_only.txt
  11_MEDIA_KIT/
    put_brand_files_here.txt
```

---

## What the downloader does

The downloader may copy or fetch approved packet files into the card structure:

- public demo packet
- industry packet
- onboarding docs
- public route files
- brand/media files
- encrypted export packets
- restore instructions

It should not download or write raw secrets.

---

## What must never be written unprotected

- Supabase service role key
- raw passwords
- raw API keys
- private Memory Chip contents
- payment secrets
- unencrypted customer databases
- private ledgers
- active access tokens

---

## Rewrite states

| State | Meaning |
|---|---|
| `DRY_RUN` | Plan generated; nothing written. |
| `TARGET_VERIFIED` | Mounted card path looks safe to write. |
| `BRAID_LAYOUT_CREATED` | Braided folders created. |
| `PACKET_DOWNLOADED` | Approved packet copied/fetched. |
| `MANIFEST_WRITTEN` | Card manifest created. |
| `HASH_SEALED` | Manifest and files hash-sealed. |
| `LEDGERED` | Rewrite recorded. |
| `READY` | Card packet ready for STITCH handshake test. |
| `BLOCKED` | Unsafe path, unsafe file, or missing approval. |

---

## Safe operating flow

```text
SELECT MICROSD PATH
  ↓
VERIFY TARGET PATH
  ↓
DRY-RUN PLAN
  ↓
OWNER APPROVAL
  ↓
CREATE BRAIDED FOLDERS
  ↓
WRITE ACCESS PACKET
  ↓
WRITE STITCH HANDSHAKE ROUTE
  ↓
WRITE MEMORY CHIP POINTER, NOT RAW MEMORY
  ↓
WRITE APPROVED CLIP BRICK PACKET
  ↓
WRITE SHIELD RULES
  ↓
WRITE RESTORE CHECKPOINT
  ↓
HASH-SEAL MANIFEST
  ↓
APPEND CARD LEDGER
  ↓
READY
```

---

## Public/private boundary

Safe to publish publicly:

- folder layout
- safety rules
- manifest schema
- rewrite states
- dry-run logic
- hash sealing method

Do not publish publicly:

- real private customer manifests
- raw access secrets
- live card IDs if tied to a real customer
- private Memory Chip records
- service keys
- internal payment or client data

---

## Honest claim boundary

SDBRAIDWRITER-001 creates a braided topology **file-system packet** on a microSD card. It does not physically alter microSD hardware, change NAND architecture, or make the card cryptographically secure by itself.

Real security still requires authentication, encryption for private exports, backend verification, STITCH handshake, CLIPPERX binding, SHIELDBRICK review, and ledger records.

Public claim:

> SDBRAIDWRITER-001 rewrites a mounted microSD card into an SB688 braided topology packet with access files, STITCH route, Memory Chip pointer, approved Clip Brick packet, SHIELD rules, restore checkpoint, hash-sealed manifest, and card ledger.
