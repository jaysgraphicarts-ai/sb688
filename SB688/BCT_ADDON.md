# SB688 Bidirectional Integrity Add-on for BCT

## Scope

This variant intentionally reduces SB688 to one responsibility:

> **Verify trusted state, detect drift, heal from a certified reserve, reverify, then release.**

Everything else is outside the latency-sensitive integrity path.

## Removed from the hot path

- UI and control-room rendering
- database calls
- network protocol implementation
- filesystem scans
- JSON manifests
- synchronous persistent audit
- business logic
- AI/LLM reasoning
- governance and policy evaluation
- analytics and telemetry aggregation
- durable checkpoint creation
- external service calls

Those capabilities may remain elsewhere in the system, but they are not prerequisites
for a trusted BCT transit.

## Bidirectional braid

```text
                 SB688 SOVEREIGN INTEGRITY BRAID

BCT SIDE A  ->  VERIFY -> HEAL? -> REVERIFY -> FRAME  -> BCT SIDE B
BCT SIDE A  <-  FRAME  <- REVERIFY <- HEAL? <- VERIFY <- BCT SIDE B

                 same gate in both directions
                 no trusted bypass
```

## Internal state

```text
CERTIFIED RESERVE
       |
       +-> WORKING STRAND 1
       +-> WORKING STRAND 2
       +-> WORKING STRAND 3
```

The three working strands must match the certified reserve. Any drift causes a
fail-closed repair before trusted transit resumes. If the certified reserve itself
fails verification, recovery is refused.

## BCT boundary

BCT is transport/topology. SB688 does not assume whether BCT uses:

- shared memory
- IPC
- device bus
- network transport
- dedicated hardware
- another future carrier

The BCT adapter only needs a send function that accepts a `BraidFrame`. This keeps
SB688 portable and prevents transport complexity from bloating the integrity core.

## Safety boundary

This code is a software research component. It is not validated for implanted,
medical, neural stimulation, or other safety-critical hardware. General-purpose
operating-system timing measurements are not hard real-time guarantees.
