# SDBRAIDWRITER-001 — USB / MicroSD Braided Topology Formatter + Rewriter

**System:** SB688 / SB689  
**Brick ID:** `SDBRAIDWRITER-001`  
**Category:** USB writer, microSD writer, mini-chip storage formatter, braided topology packet layout, manifest sealer  
**Status:** Public-safe Clip Brick specification  

---

## Purpose

SDBRAIDWRITER-001 restructures a mounted USB drive, mini storage chip, SD card, or microSD card into a safe SB688 braided topology storage packet.

It supports storage devices of different sizes. 32GB to 124GB is a strong practical range for system packets, media kits, demos, encrypted exports, restore folders, and working room files. Smaller cards, like 8GB, can still be rewritten into a braided storage packet, but they should be treated as lighter storage/access cards instead of full system kits.

It does **not** physically change the silicon, NAND, controller firmware, or hardware topology of the device. It changes the device's software storage structure: folder layout, manifests, hash chain, access packet, demo packet, restore checkpoint, truth nodes, verification records, and stitched memory pointers.

---

## Core law

```text
No storage rewrite becomes trusted until the target path is verified, the braid layout is built, the manifest is hash-sealed, the truth nodes are created, and the write is ledgered.
```

---

## What “braided topology” means on storage

On a physical card or USB drive, braided topology means the memory is organized into separate verified lanes that cross-check each other.

```text
REACTIVE BRAID
  Fast access files, launch instructions, QR route, emergency rules.

DELIBERATIVE BRAID
  business packet, approved Clip Bricks, onboarding docs, work plans.

REFLECTIVE BRAID
  truth nodes, verification logs, restore checkpoints, ledger records.
```

The memory is then stitched together by manifests and hashes.

```text
file/folder lanes
  ↓
manifest records
  ↓
truth node hashes
  ↓
ledger events
  ↓
restore checkpoint
  ↓
STITCH handshake route
```

---

## Capacity guidance

| Device size | Best use |
|---|---|
| `8GB` | Light access card, basic public packet, QR route, small docs, simple restore pointer. |
| `16GB` | Demo card, onboarding packet, small brand kit, light encrypted exports. |
| `32GB` | Recommended baseline for business access cards and braided storage packets. |
| `64GB` | Strong business kit: media, demos, exports, restore packet, larger files. |
| `124GB / 128GB` | Full system kit, larger media kit, multi-industry demo, bigger encrypted exports. |

An 8GB card can be rewritten into braided topology storage. It simply has less room for media, exports, and restore data.

---

## Braided topology storage layout

```text
SB688_CARD/
  00_READ_FIRST/
    README.txt
    OWNER_INSTRUCTIONS.txt

  01_REACTIVE_BRAID/
    access_key/
      public_card_id.txt
      qr_route.txt
      access_manifest.json
    launch/
      start_here.txt
      emergency_rules.txt

  02_DELIBERATIVE_BRAID/
    stitch_handshake/
      stitch_route.json
      handshake_rules.json
    clip_bricks/
      approved_bricks.json
      public_demo_bricks/
    business_packet/
      business_packet_manifest.json
      put_business_docs_here.txt

  03_REFLECTIVE_BRAID/
    memory_link/
      memory_chip_pointer.json
      no_raw_secrets.txt
    truth_nodes/
      truth_node_manifest.json
      file_hash_index.json
    verification/
      verification_rules.json
      verification_report.json
    ledger/
      card_ledger.jsonl
      card_manifest.sha256
    restore/
      restore_manifest.json
      recovery_instructions.txt

  04_SHIELD/
    shield_rules.json
    blocked_items.txt

  05_CHIPFORGE/
    card_program_manifest.json
    rewrite_history.jsonl

  06_AVA_ROOM/
    ava_start_here.txt
    room_rules.json

  07_EXPORTS/
    encrypted_exports_only.txt

  08_MEDIA_KIT/
    put_brand_files_here.txt
```

---

## Self-healing and resurrection model

SDBRAIDWRITER-001 creates a software-level self-healing pattern:

- every important file is indexed in `file_hash_index.json`
- the full card manifest is sealed in `card_manifest.sha256`
- rewrite events are stored in `rewrite_history.jsonl`
- card events are stored in `card_ledger.jsonl`
- restore instructions are stored in the Reflective Braid
- Memory Chip contents are not copied raw; only a pointer is written
- corrupted or missing files can be detected by comparing current hashes to truth-node hashes

This is software verification and restore support. It is not magic hardware repair.

---

## What the downloader does

The downloader may copy or fetch approved packet files into the braided storage structure:

- public demo packet
- industry packet
- onboarding docs
- public route files
- brand/media files
- encrypted export packets
- restore instructions
- approved Clip Brick files
- verification manifest

It should not download or write raw secrets.

---

## What must never be written unprotected

- Supabase service role key
- raw passwords
- raw API keys
- private Memory Chip contents
- payment secrets
- unencrypted customer databases
- private ledgers tied to real customers
- active access tokens

---

## Rewrite states

| State | Meaning |
|---|---|
| `DRY_RUN` | Plan generated; nothing written. |
| `TARGET_VERIFIED` | Mounted card/USB path looks safe to write. |
| `BRAID_LAYOUT_CREATED` | Triple-braid folder structure created. |
| `PACKET_DOWNLOADED` | Approved packet copied/fetched. |
| `MANIFEST_WRITTEN` | Storage manifest created. |
| `TRUTH_NODES_BUILT` | File-hash truth nodes created. |
| `HASH_SEALED` | Manifest and file index hash-sealed. |
| `LEDGERED` | Rewrite recorded. |
| `READY` | Braided storage packet ready for STITCH handshake test. |
| `BLOCKED` | Unsafe path, unsafe file, or missing approval. |

---

## Safe operating flow

```text
SELECT USB / SD / MICROSD PATH
  ↓
VERIFY TARGET PATH
  ↓
DRY-RUN PLAN
  ↓
OWNER APPROVAL
  ↓
OPTIONAL CLEAN TARGET FOLDER
  ↓
CREATE TRIPLE-BRAID STORAGE LAYOUT
  ↓
WRITE REACTIVE BRAID
  ↓
WRITE DELIBERATIVE BRAID
  ↓
WRITE REFLECTIVE BRAID
  ↓
WRITE MEMORY CHIP POINTER, NOT RAW MEMORY
  ↓
WRITE APPROVED CLIP BRICK PACKET
  ↓
WRITE SHIELD RULES
  ↓
WRITE RESTORE CHECKPOINT
  ↓
BUILD TRUTH NODE HASH INDEX
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
- truth-node format without real customer data

Do not publish publicly:

- real private customer manifests
- raw access secrets
- live card IDs if tied to a real customer
- private Memory Chip records
- service keys
- internal payment or client data

---

## Honest claim boundary

SDBRAIDWRITER-001 creates a braided topology **file-system packet** on USB, SD, mini storage chip, or microSD media. It does not physically alter hardware, change NAND architecture, or make the device cryptographically secure by itself.

Real security still requires authentication, encryption for private exports, backend verification, STITCH handshake, CLIPPERX binding, CHIPFORGE programming rules, SHIELDBRICK review, and ledger records.

Public claim:

> SDBRAIDWRITER-001 formats and rewrites mounted USB, SD, mini-chip, or microSD storage into an SB688 braided topology packet with Reactive, Deliberative, and Reflective braid folders, STITCH route, Memory Chip pointer, approved Clip Brick packet, SHIELD rules, truth-node hash index, restore checkpoint, hash-sealed manifest, and card ledger.
