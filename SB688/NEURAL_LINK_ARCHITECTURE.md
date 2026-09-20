# SB688 Neural-Link Architecture

## Purpose

Use SB688 as the integrity gate between a brain-computer interface and BCT/AI.

```text
BRAIN / NEURAL INTERFACE
        |
        v
VALIDATED HARDWARE SAFETY BOUNDARY
        |
        v
SB688 SOVEREIGN INTEGRITY BRAID
verify -> detect drift -> heal -> reverify
        |
        v
BCT BIDIRECTIONAL TRANSPORT
        |
        v
AI / COMPUTE LAYER
```

The same structure applies in reverse:

```text
AI / COMPUTE
   |
   v
BCT
   |
   v
SB688 VERIFY / HEAL / REVERIFY
   |
   v
INDEPENDENT HARDWARE SAFETY GATE
   |
   v
NEURAL DEVICE
```

## Non-negotiable boundary

SB688 does not:

- generate stimulation waveforms
- choose current, voltage, charge, pulse width, frequency, or electrode target
- bypass implant firmware or medical interlocks
- authorize its own neural write
- treat AI output as sufficient authority for neural stimulation

Every neural write requires a separate validated hardware safety decision after
SB688 integrity verification.

## SB688 job

Only:

1. verify the certified integrity state
2. detect drift
3. repair working strands from the certified reserve
4. reverify
5. pass or reject the packet

That keeps the hot path small enough to optimize independently from BCT, AI,
logging, UI, durable storage, and analytics.

## Why this shape matters

For a neural interface, speed alone is not enough. The architecture must prevent
a corrupted or stale software state from becoming a trusted neural output.
SB688 therefore sits before release in both directions, while physical safety is
owned by an independent lower-level hardware boundary.

## Status

This repository implementation is a software research/simulation interface only.
It is not a medical-device implementation, not implant firmware, and not validated
for human neural stimulation.
