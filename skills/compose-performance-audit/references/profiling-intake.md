# Compose Profiling Intake

Collect:

- affected screen or flow
- exact start and stop points
- target device or emulator model and Android version
- app variant and whether it is debug, profileable, or release-like
- reproduction frequency
- expected versus observed behavior
- recent code changes
- existing benchmark, trace, or frame-stat artifacts

## Choose Evidence

| Symptom | First evidence |
| --- | --- |
| Startup feels slow | Macrobenchmark startup metric and trace |
| Scroll or animation jank | Macrobenchmark frame metric and Perfetto |
| CPU spike | Simpleperf plus Perfetto timeline |
| Excessive recomposition suspicion | Code review, compiler reports if configured, then Perfetto Compose traces when available |
| Memory growth | `dumpsys meminfo`, heap dump, memory-leaks skill |

Keep one capture to one user-visible flow. Avoid broad traces with unclear attribution.
