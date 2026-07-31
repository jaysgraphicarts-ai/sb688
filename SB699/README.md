# SB-699 IronLink3 Braided Recovery Layer

This package adds a verification-first recovery layer intended for attachment to
the IronLink3 unified control plane.

## Implemented controls

- Three-strand `LIVE` / `MIRROR` / `WITNESS` checkpoints
- Mandatory verified backup before reset authorization
- Independent Phoenix reserve and verified setback reads
- Node patrol that quarantines disagreement instead of guessing a majority
- Runtime "atmosphere" monitoring for memory, disk, and heartbeat pressure
- Atomic writes, SHA-256 manifests, linked audit events, and fail-closed errors

## Honest boundary

This is functional storage and verification code, not a claim that arbitrary
applications can be repaired while running. IronLink3 must quiesce each target,
capture its authorized state, call `checkpoint_before_reset`, obtain reset
authorization, and explicitly apply bytes returned by `phoenix_setback`.

## Test

```bash
python -m unittest discover -s tests -v
```

Run from this directory with Python 3.10 or newer. No third-party dependency is
required.
