# AVABRICK-001 — AVA Business Operator Clip Brick

**System:** SB688 / SB689  
**Brick ID:** `AVABRICK-001`  
**Category:** Business operator, task routing, customer-room assistant  
**Status:** Public-safe Clip Brick specification  

---

## Purpose

AVABRICK-001 is the business operator brick.

It activates after CLIPPERX verifies the business room, access key, Memory Chip, approved Clip Bricks, and STITCH handshake.

AVA does not own the room. AVA operates inside the approved room.

```text
CLIPPERX OPENS ROOM
  ↓
AVA READS APPROVED CONTEXT
  ↓
AVA ROUTES TASK TO APPROVED CLIP BRICK
  ↓
SHIELDBRICK CHECKS RISK
  ↓
VERA / HUMAN APPROVAL WHEN NEEDED
  ↓
LEDGER RECORDS ACTION
```

---

## Core law

```text
AVA may assist only inside a verified business room, using approved memory, approved bricks, and bounded actions.
```

---

## Module map

```json
{
  "brick_id": "AVABRICK-001",
  "modules": {
    "room_context_reader": {
      "job": "read approved business-room context after CLIPPERX passes",
      "requires_live_room": true
    },
    "task_router": {
      "job": "route business requests to the correct approved Clip Brick",
      "requires_approved_brick": true
    },
    "customer_voice_adapter": {
      "job": "match the business voice, tone, and operating style",
      "requires_memory_chip": true
    },
    "action_drafter": {
      "job": "draft posts, replies, plans, scripts, checklists, and next steps",
      "commits_directly": false
    },
    "approval_gate": {
      "job": "hold sensitive or external actions for owner approval",
      "requires_shieldbrick": true
    },
    "session_summary_writer": {
      "job": "write clean session summaries back to approved memory",
      "requires_ledger": true
    },
    "audit_ledger": {
      "job": "record AVA session decisions and outputs",
      "mode": "append_only"
    }
  }
}
```

---

## Operating flow

```text
USER REQUEST INSIDE BUSINESS ROOM
  ↓
AVA CHECKS ROOM STATE
  ↓
AVA CHECKS APPROVED BRICKS
  ↓
AVA ROUTES TASK
  ↓
AVA DRAFTS OUTPUT
  ↓
SHIELDBRICK + VERA REVIEW
  ↓
OWNER APPROVAL IF NEEDED
  ↓
LEDGER RECORD
  ↓
MEMORY SUMMARY WRITE
```

---

## AVA can help with

- sales scripts
- captions and content plans
- booking prep
- customer replies
- music release planning
- merch drop planning
- restaurant specials
- contractor estimates checklist
- barber appointment reminders
- brand tone consistency
- business intake summaries
- session recap and next steps

---

## AVA should not do without approval

- publish public posts
- send legal statements
- change pricing live
- send payment information
- overwrite private memory
- expose customer data
- claim official endorsement
- act outside approved Clip Bricks
- bypass SHIELDBRICK or VERA

---

## States

| State | Meaning |
|---|---|
| `OFFLINE` | No verified room. |
| `ROOM_LOCKED` | CLIPPERX has not opened the business room. |
| `READY` | Room is live and AVA can draft. |
| `DRAFTING` | AVA is preparing an output. |
| `APPROVAL_REQUIRED` | Sensitive action must be approved. |
| `LEDGERED` | Session/action recorded. |
| `MEMORY_UPDATED` | Approved summary written back to Memory Chip. |

---

## Public/private boundary

Safe to publish publicly:

- AVA role
- workflow
- approval states
- examples of support tasks
- public claim boundary

Do not publish publicly:

- private business memory
- customer records
- private session logs
- raw prompts containing secrets
- private API keys
- unapproved client outputs

---

## Honest claim boundary

AVABRICK-001 is a business-operator software brick for drafting, routing, approval prep, session summaries, and bounded assistance inside a verified business room.

It does not replace a licensed professional, business owner approval, legal review, financial review, or human judgment.

Public claim:

> AVABRICK-001 lets AVA operate inside an approved SB688 business room by routing tasks to approved Clip Bricks, drafting business outputs, holding sensitive actions for approval, and recording sessions into the ledger.
