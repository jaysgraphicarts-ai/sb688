# Stitch Security Threat Model

This document defines the defensive model for the public SB688/SB689 Stitch repo and any deployed Stitch runtime.

## Prime Law

No active state becomes trusted state without verification.

## Protected Assets

- Owner identity and approval channels
- API keys, tokens, private keys, passwords, passcodes
- Pocket memory and total-recall archives
- JGA/JPS/JGA Enterprises confidential records
- Client data, contracts, payments, business operations
- Stitch ledger and checkpoint history
- Runtime authorization sessions
- Source code and proprietary architecture

## Trust Zones

1. Public repo: sanitized docs, schemas, UI, safe reference code only.
2. Runtime server: authenticated APIs, no raw secrets in logs.
3. Private vault: encrypted memory, sensitive records, private owner data.
4. Mobile/chip memory: encrypted export only, removable and revocable.
5. External internet: untrusted quarantine until verified.

## Threats and Defenses

| Threat | Defense |
|---|---|
| Secret committed to repo | .gitignore, env templates, secret scanning, public-safe classifier |
| Prompt injection | input normalization, capability checks, output verification, quarantine |
| Memory poisoning | classify source, verify before commit, append-only ledger, owner approval |
| Session hijack | one-hour expiry, hashed tokens, owner API key, rate limiting |
| SMS approval abuse | code expiry, deny flow, provider env vars only, event ledger |
| Ledger tamper | hash chain verification before response commit |
| Replay attack | nonce, timestamp, previous hash, chain head checks |
| Sensitive data leakage | redaction, classification, private vault separation |
| Dependency compromise | lockfile review, npm audit, minimal dependencies, pin critical versions |
| Denial of service | rate limiting, body-size limit, timeout, queue limits |
| Cross-site attack | security headers, no-store cache, JSON-only mutation APIs |
| Unauthorized remote access | no default admin mode, no hardcoded passcodes, owner-key required |
| AI hallucination | verified/inferred/unverified/simulated labels, hold-and-check behavior |
| Drift | snapshot compare, Ghost replay, Seed restore, ledger event |

## Required Environment Variables

```txt
STITCH_OWNER_API_KEY=
STITCH_OWNER_PHONE=
STITCH_SESSION_SECRET=
STITCH_VAULT_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
DATABASE_URL=
```

Never commit real values.

## Capability Tiers

- observer: read runtime, view topology
- memory: read/upload/export pocket memory
- operator: diagnostics and memory import
- builder: branch and pull request proposals
- sovereign: owner-gated admin override

## Incident Response

1. Freeze elevated sessions.
2. Verify security ledger.
3. Rotate secrets.
4. Export and seal current memory card.
5. Compare with last known good checkpoint.
6. Quarantine suspicious memory records.
7. Restore trusted state.
8. Append incident ledger entry.
9. Resume only after owner approval.

## Public Repo Rules

Allowed:
- sanitized architecture
- defensive code
- schemas
- UI shell
- docs
- env examples

Forbidden:
- raw phone numbers
- passwords
- API keys
- private keys
- client records
- payment details
- private memory exports
- confidential full IP disclosure
