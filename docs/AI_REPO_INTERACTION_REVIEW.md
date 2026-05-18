# JGA AI Repo Interaction Review

## Purpose

This file records the current connected repository review for AI interaction, branch awareness, and improvement planning.

## Connected Repositories Seen

- jaysgraphicarts-ai/jga-sovereign-stitch-core-v4
- jaysgraphicarts-ai/gh-connector-test
- jaysgraphicarts-ai/Projects
- jaysgraphicarts-ai/Desktop
- jaysgraphicarts-ai/jga-os
- jaysgraphicarts-ai/sb688

## Primary Active Repo

- Repository: jaysgraphicarts-ai/sb688
- Active working branch: sb689-stitch-hivemind
- Default branch: main

## AI Interaction Policy

Every repo and branch should expose a safe AI interaction contract:

1. AI may inspect public doctrine and repo code when permitted.
2. AI must never treat secrets, passcodes, private keys, tokens, or tenant data as shareable.
3. AI must respect owner authority.
4. AI must distinguish designed features from runtime-proven features.
5. AI must log or report proposed changes.
6. AI must not make destructive changes without explicit owner authorization.
7. AI must use branch-safe work: review, patch, verify, report, then merge only after proof.
8. AI must preserve the Stitch law: no active state becomes trusted state without verification.

## Recommended Repo Standard Files

Each repo should eventually contain:

- README.md
- docs/STITCH_REPO_INTERACTION.md
- docs/AI_BOUNDARY.md
- docs/SECURITY.md
- docs/CHANGELOG.md
- .env.example
- .gitignore
- .github/workflows/ci.yml
- OWNER_ROOM_CHECKPOINT.md

## Branch Review Policy

All branches should be reviewed for:

- build status;
- stale code;
- duplicate doctrine;
- secret exposure;
- missing README;
- missing environment examples;
- missing CI;
- missing license/security policy;
- branch purpose;
- merge readiness;
- runtime proof.

## Improvement Plan

Phase 1: establish sb688 as the command repo.

Phase 2: add shared AI interaction docs to every repo.

Phase 3: review branches and open issues for stale or risky branches.

Phase 4: add CI and security scanning.

Phase 5: connect repo reports into the Owner's Room dashboard.

## Current Tie-Off

This review is active for sb688 and should be propagated to other repositories only after each repo is inspected individually.

Never claim all branches are fixed unless each branch has been inspected and the fix is committed with proof.
