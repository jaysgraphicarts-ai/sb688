# JGA Stitch Hive Mind — Multilingual Access and Task Queue Completion Law

## Core Law

```text
Every user-facing system must support language selection for spoken and written interaction.
Every task must enter a queue, receive a state, complete in order of authority and urgency, and tie off with proof.
```

## Purpose

The Stitch Hive Mind must serve businesses, tenants, customers, workers, operators, AI agents, compliance agents, and tax agents across different languages and communication modes.

It must also prevent scattered, half-finished, or forgotten operations by placing every request into a sequenced task queue.

This law applies to:

- Owner's Room;
- Business Bricks;
- Micro-Chips;
- Mini-Chips;
- tenant dashboards;
- customer intake;
- HR/session workflows;
- compliance agents;
- tax agents;
- recordkeeping systems;
- AI interaction layers;
- emergency reports;
- visual command center;
- spoken interfaces;
- written interfaces.

---

## Multilingual Selection

Every user-facing Brick should allow language selection.

Language selection must apply to:

- written text;
- spoken prompts;
- voice input;
- voice output;
- forms;
- reports;
- alerts;
- dashboards;
- onboarding;
- customer intake;
- compliance reminders;
- tax-prep exports;
- HR/session notices;
- support conversations.

---

## Language Profile

Each user, tenant, Brick, and session may carry a language profile.

Minimum fields:

- preferred_written_language;
- preferred_spoken_language;
- fallback_language;
- translation_required;
- interpreter_required;
- accessibility_notes;
- region_or_locale;
- date_format;
- currency_format;
- time_zone;
- legal_notice_language;
- consent_language;
- last_language_verified_at.

---

## Spoken and Written Modes

Supported modes:

| Mode | Purpose |
|---|---|
| written_only | standard text interaction |
| spoken_input | user speaks, system converts to task/request |
| spoken_output | system reads responses aloud |
| bilingual_written | system shows two written languages |
| bilingual_spoken | system supports two spoken languages |
| assisted_translation | human or approved translation review needed |
| accessibility_mode | simplified, enlarged, read-aloud, or assistive interaction |

---

## Translation Truth Boundary

Translations must preserve meaning, scope, warnings, disclaimers, consent language, tax/legal boundaries, and owner authority.

The system must not silently change legal, tax, compliance, HR, or contract meaning during translation.

High-impact translated content should be marked:

```text
translation_review_required
```

when it affects:

- taxes;
- legal notices;
- contracts;
- employment/HR;
- compliance obligations;
- consent;
- billing;
- cancellation;
- tenant responsibility;
- government notices;
- emergency cutoff;
- audit reports.

---

## Supported Task Queue

Every request becomes a task.

Task flow:

```text
capture → translate if needed → classify → scope → prioritize → verify → execute/stage → review → report → tie off
```

No important request should remain only in chat memory.

---

## Task State Model

Every task must have one state:

| State | Meaning |
|---|---|
| captured | request received |
| translated | language handled |
| classified | type and risk identified |
| scoped | tenant/Brick/state/system identified |
| queued | waiting for action |
| active | being worked |
| blocked | missing proof, authority, or data |
| needs_owner | owner review required |
| needs_professional | accountant/legal/payroll review required |
| staged | fix prepared but not deployed |
| verified | proof checked |
| completed | task done |
| tied_off | checkpoint/report created |
| rejected | unsafe or unauthorized |
| quarantined | held for safety review |

---

## Task Priority Model

Priority order:

1. emergency cutoff and safety;
2. owner authority/security;
3. tenant data isolation;
4. legal/tax/compliance deadlines;
5. billing/subscription continuity;
6. customer/business operations;
7. HR/session sensitivity;
8. recordkeeping integrity;
9. performance bottlenecks;
10. feature upgrades;
11. cosmetic improvements.

---

## Sequencing Rule

Tasks must be sequenced by:

- authority;
- urgency;
- dependency;
- risk;
- tenant impact;
- state deadline;
- subscription status;
- emergency level;
- proof availability.

A later task may not override a higher-priority unfinished task unless the Owner's Room approves.

---

## Queue Record Fields

Every task record should include:

- task_id;
- parent_task_id;
- tenant_id;
- brick_id;
- state;
- requester;
- requester_role;
- language_profile;
- original_text;
- translated_text;
- spoken_transcript_hash if applicable;
- task_type;
- priority;
- risk_level;
- authority_required;
- status;
- dependencies;
- assigned_agent;
- affected_memory;
- affected_records;
- affected_repo;
- affected_branch;
- proof_required;
- proof_attached;
- ledger_hash;
- previous_ledger_hash;
- tie_off_checkpoint.

---

## Completion Rule

A task is not complete until it has:

1. final status;
2. proof or honest limitation;
3. ledger entry;
4. report summary;
5. tie-off state;
6. next action or no-action-needed marker.

If proof is missing, the task must be marked:

```text
designed_not_runtime_proven
```

or:

```text
blocked_missing_verification
```

---

## Owner's Room Queue

The Owner's Room must show:

- active tasks;
- blocked tasks;
- emergency tasks;
- compliance/tax deadlines;
- repo branch work;
- Brick creation tasks;
- AI connection requests;
- memory promotion requests;
- translation review tasks;
- professional review tasks;
- tie-off checkpoints.

---

## Business Brick Queue

Each Business Brick must show its own queue:

- customer requests;
- design jobs;
- invoices;
- receipts;
- state compliance alerts;
- tax record gaps;
- HR actions;
- uploads/downloads;
- subscription events;
- AI assistance requests;
- support tickets;
- export tasks.

No tenant can see another tenant's queue.

---

## Language Safety for Tax and Compliance Agents

State Compliance Agents and Tax Agents must preserve original source language where possible.

Reports should include:

- original source language;
- translated summary;
- official source reference;
- confidence;
- translation review status;
- professional review recommendation.

Tax/legal/compliance translations must never become final advice without qualified review.

---

## Noise and Spine Protection

Language tools and task queues may not touch the Spine.

Unverified translated content, unclear voice transcripts, noisy audio, uncertain source material, and unsupported claims must be silenced, quarantined, or escalated.

The Spine accepts only verified, scoped, owner-approved law changes.

---

## Final Operating Loop

```text
listen/read → identify language → translate safely → classify task → queue → prioritize → execute/stage → verify → report → tie off
```

The Stitch must meet people in their language, preserve meaning, complete tasks in sequence, and never allow noise, mistranslation, or unfinished work to corrupt the system.
