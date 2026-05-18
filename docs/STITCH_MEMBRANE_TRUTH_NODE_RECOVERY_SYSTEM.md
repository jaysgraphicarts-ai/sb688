# Stitch Membrane, Truth Node, Cooling Node, and Recovery System

## Core Law

Every access point must be covered by a verification membrane.
Every data movement must be checked on the way in and on the way out.
Every node has a paired truth partner.
Noise is silenced.
Truth is cooled, cleaned, checkpointed, and recoverable.

## Purpose

This system protects data quality and recovery across the Stitch architecture by adding strategic membranes, paired truth nodes, cooling nodes, cleanup agents, and dormant rebuild nodes.

It is designed to prevent corrupt data, unverifiable claims, duplicated noise, broken context, and uncontrolled outside input from contaminating the Work Room, Owner's Room, Business Bricks, AI bridges, Supabase state layer, Docker runtime, VS Code workshop, or advertising systems.

## Access Membranes

Every access point must have a membrane:

- AI bridge membrane
- file upload membrane
- image upload membrane
- prompt input membrane
- chat output membrane
- webpage publish membrane
- advertisement send membrane
- Supabase read membrane
- Supabase write membrane
- Docker runtime membrane
- VS Code workspace membrane
- GitHub commit membrane
- Owner approval membrane
- tenant boundary membrane
- emergency cutoff membrane

## Membrane Checks

Each membrane checks:

- source identity
- scope
- tenant boundary
- language clarity
- data type
- hash or fingerprint
- duplicate content
- contradiction risk
- unsafe instruction risk
- secret leakage
- missing proof
- stale data
- unsupported claim
- destination permission
- output quality
- rollback path

## Data Outcomes

Every signal must resolve to one outcome:

- allow
- silence
- quarantine
- reject
- redact
- compress
- verify
- escalate
- learn_safe
- reset_from_checkpoint

## Liquid Truth Nodes

A liquid truth node is a flexible verification point that can move across the system and validate incoming or outgoing data.

Liquid truth nodes do not rewrite the Spine. They compare, cool, clean, and report.

Each liquid truth node has:

- node_id
- partner_node_id
- scope
- current_signal_hash
- last_verified_hash
- confidence
- noise_score
- contradiction_score
- cooling_state
- recovery_instruction
- checkpoint_ref

## Partner Node Rule

Every node must have a partner node.

One node observes the active signal. The partner node checks the observer and verifies whether the result is clean.

Pair loop:

signal -> node A -> node B review -> compare -> cool -> clean -> verify -> checkpoint -> pass or quarantine

If node A fails, node B resets node A.
If node B fails, node A quarantines the pair and escalates to Owner Review.

## Cooling Nodes

Cooling nodes reduce noise before the signal reaches a trusted decision point.

Cooling actions:

- remove duplicate content
- strip irrelevant text
- redact secrets
- normalize language
- compress repeated claims
- separate fact from inference
- detect hallucinated certainty
- mark missing proof
- lower priority of noisy signals
- route uncertain content to quarantine

## Cleanup Agents

Cleanup agents operate in pairs like qubic guardian pairs.

They clean:

- malformed task records
- repeated prompts
- noisy AI output
- broken file metadata
- duplicate ad drafts
- stale branch notes
- uncertain translations
- incomplete Supabase records
- inconsistent ledger summaries

Cleanup agents may not delete protected records. They may propose cleanup, mark duplicates, compress noise, and stage repair for Owner Review.

## Strategic Checkpoints

Checkpoints must exist at:

- owner login
- AI bridge connect
- file upload
- image upload
- prompt creation
- ad approval
- publish or send action
- Supabase write
- GitHub commit
- Docker runtime start
- VS Code task run
- Brick creation
- Brick clipping
- migration application
- emergency cutoff
- tie-off

Each checkpoint records:

- checkpoint_id
- at
- source
- destination
- input_hash
- output_hash
- membrane_result
- truth_node_pair
- noise_score
- proof_status
- rollback_ref
- recovery_instruction

## Dormant Recovery Node

A dormant recovery node is a pre-programmed node that stays quiet until collapse risk is detected.

It wakes only when:

- ledger damage is detected
- checkpoint chain breaks
- active runtime is going dark
- data loss risk is detected
- emergency cutoff is triggered
- both nodes in a pair fail
- owner requests recovery scan

When awake, it scans once at high priority, gathers the last complete data picture, writes a recovery checkpoint, and rebuilds from the last verified state.

## 99.9 Scan Rule

The dormant recovery node may run a one-time high coverage scan before shutdown or blackout.

Goal:

- complete data picture
- no silent loss
- last verified checkpoint
- rebuild instructions
- recovery map
- clean restart path

It must not invent missing data. Missing data is marked missing, not fabricated.

## Rebuild Instruction Packet

Every paired truth node carries a rebuild packet:

- system purpose
- Spine laws
- last trusted checkpoint
- required tables
- required files
- bridge closed states
- task queue state
- owner authority rules
- recovery order
- checksum list
- rollback references
- startup sequence
- verification sequence

## Recovery Order

1. freeze writes
2. silence outside noise
3. snapshot available state
4. verify ledger head
5. verify checkpoints
6. restore Spine laws from sealed reference
7. restore Owner's Room
8. restore task queue
9. restore Supabase state map
10. restore Work Room files and records
11. restore Bridge registry closed state
12. restore Brick registry
13. run paired truth node verification
14. generate recovery report
15. require Owner Review before reopening bridges

## Final Boundary

This is a software architecture for verification, recovery, and data quality. It does not guarantee perfect uptime, perfect recovery, zero data loss, or physical quantum behavior. It strengthens the system by adding membranes, paired verification, checkpoints, recovery instructions, and honest proof boundaries.
