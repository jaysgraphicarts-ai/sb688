# SB688 Microspine benchmark

The microspine removes disk I/O, JSON parsing, filesystem scans, network work,
UI work, and synchronous persistent audit writes from the latency-sensitive path.
The durable recovery/audit plane remains separate and unchanged.

## Local software benchmark

Environment: ChatGPT execution container, general-purpose OS. Payloads were tested
for 10,000 clean cycles and 10,000 deterministic single-strand fault/recovery cycles.
These are software measurements, not hard real-time guarantees and not medical-device validation.

| Payload | Clean median | Clean p99 | Fault->heal median | Fault->heal p99 |
|---:|---:|---:|---:|---:|
| 64 B | 0.002587 ms | 0.004799 ms | 0.004477 ms | 0.008160 ms |
| 256 B | 0.002973 ms | 0.003363 ms | 0.005018 ms | 0.009140 ms |
| 4 KiB | 0.013818 ms | 0.035098 ms | 0.021695 ms | 0.051737 ms |
| 64 KiB | 0.182828 ms | 0.317348 ms | 0.285523 ms | 0.482169 ms |

Rare scheduler outliers occurred on the general-purpose OS. Therefore the code
must not be described as deterministically sub-millisecond until tested under a
real-time scheduler/hardware environment with worst-case latency instrumentation.
