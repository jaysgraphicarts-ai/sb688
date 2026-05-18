# Stitch Complete System Integration Map

## Purpose

This is the complete integration map for the current Stitch system. It combines the Owner's Room, Work Room Brick, closed bridges, local bridge, advertising center, task queue, file vault, Supabase schema, Docker/VS Code sync law, and Spine protection into one controlled system.

## Core system law

Nothing touches the Spine.
Unverifiable outside noise is silenced.
Every task is queued.
Every meaningful GitHub change must be accounted for in Docker, VS Code, and Supabase.
All bridges stay closed until Owner's Room enables them.

## Main command layers

1. Owner's Room: final authority, approval, emergency cutoff, tie-in and tie-off.
2. Work Room Brick: one workspace for AI chats, files, pictures, pages, tests, and Brick coding.
3. AI Desk: proposal-only adapters for ChatGPT, Grok, Gemini, Perplexity, and future AI tools.
4. File Vault: stores files and image records with scope, hash, review status, and metadata.
5. Advertisement Prompt Center: creates, edits, reviews, schedules, publishes, and sends ads only after approval.
6. Brick Forge: builds and packages Business Bricks and Micro-Chips.
7. Web Lab: creates and tests webpages.
8. Test Lab: runs diagnostics and proof checks.
9. Supabase State Layer: records tasks, files, campaigns, assets, sync tasks, and future tenant data.
10. Docker Runtime Layer: container and runtime path for server, local bridge, and future services.
11. VS Code Workshop Layer: local development tasks, debug configs, scripts, and operator workflow.

## Bridge policy

All bridges are created closed by default.

Closed bridge registry includes:

- local-ai-bridge
- chatgpt-bridge
- grok-bridge
- gemini-bridge
- perplexity-bridge
- cloudflare-tunnel-bridge
- tailscale-bridge
- mtls-bridge
- github-oidc-bridge

No bridge may publish, send, deploy, merge, read secrets, cross tenants, or write the Spine unless Owner's Room creates a verified policy path.

## Local-first bridge path

The first active bridge path is local-only.

Local bridge path:

local AI or local tool -> localhost bridge -> scoped session -> proposal -> Owner Review -> queue -> verify -> tie off

Remote tunnel bridges remain closed until local bridge is tested.

## Task flow

capture -> language check -> classify -> scope -> queue -> prioritize -> execute or stage -> verify -> owner review where needed -> report -> tie off

## Advertising flow

idea -> prompt -> draft -> edit -> compliance scan -> owner approval -> schedule or send -> log -> performance notes -> tie off

## Platform sync flow

GitHub commit -> Docker review -> VS Code review -> Supabase review -> runtime test -> tie off

## Supabase tables currently planned

- work_room_items
- work_room_files
- ad_campaigns
- ad_assets
- platform_sync_tasks

## Runtime files currently planned or added

- server/localStitchBridge.ts
- server/closedBridgeRegistry.ts
- server/tieInTieOffProtocol.ts
- server/stitchSecurity.ts

## Safety outcomes

Every outside signal becomes one of:

- silence
- quarantine
- reject
- redact
- verify
- escalate
- learn_safe

## Completion rule

A feature is not complete until it has:

- GitHub proof
- Docker status
- VS Code status
- Supabase status
- runtime proof or honest limitation
- rollback or tie-off checkpoint

## Current truth boundary

The current system is repo-wired and partially runtime-skeletoned. It is not fully production-live until Docker, VS Code, Supabase application, and runtime tests are executed with proof.

## Tie-off

This map becomes the current complete system connection point for the SB689 Stitch Sovereign Operations Phase.
