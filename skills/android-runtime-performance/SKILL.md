---
name: android-runtime-performance
description: Capture and interpret Android runtime performance evidence with Macrobenchmark, Baseline Profiles, Perfetto, Simpleperf, and gfxinfo. Use when profiling startup or interaction latency, diagnosing jank or frame drops, finding CPU-heavy functions, comparing before and after performance, generating Baseline Profiles, or proving a runtime optimization.
---

# Android Runtime Performance

## Overview

Profile one focused user-visible flow at a time. Prefer Macrobenchmark for repeatable app-level metrics and Perfetto for timeline root cause. Use Simpleperf for sampled CPU hotspots and `gfxinfo` only as a fast directional check.

Pair with `../android-debugger-agent/SKILL.md` for build, install, launch, UI driving, screenshots, and logcat.

Read:

- `references/macrobenchmark-and-baseline-profiles.md` for benchmark module setup and Baseline Profile work.
- `references/manual-tracing.md` for Perfetto, Simpleperf, and `gfxinfo` capture commands.

## Core Workflow

1. Define one flow with exact start and stop points.
2. Record target device, Android version, app variant, build type, compilation mode, and run count.
3. Choose the evidence source that answers the question.
4. Capture artifacts into a run-specific folder outside the skill directory.
5. Analyze the artifact from that exact run.
6. Apply the smallest justified fix.
7. Re-run the same flow with comparable setup.

## Choosing Evidence

- Use **Macrobenchmark** for startup timing, frame timing, scrolling, animations, and repeatable release-like comparisons.
- Use **Baseline Profiles** to optimize important startup and interaction paths for first-run performance.
- Use **Perfetto** for frame timelines, scheduler gaps, main-thread stalls, binder work, locks, and app trace sections.
- Use **Simpleperf** for sampled Kotlin, Java, native, and framework CPU stacks.
- Use **gfxinfo framestats** for a quick jank snapshot before a deeper Perfetto trace.

## Macrobenchmark Defaults

- Keep benchmark code in a separate `com.android.test` module.
- Benchmark a `profileable` target app variant.
- Prefer a physical device for user-facing performance numbers.
- Use an emulator only for workflow rehearsal or coarse regression direction.
- Run repeated measurements and preserve JSON and trace artifacts.
- Keep compilation mode explicit when comparing runs.

Typical command:

```bash
./gradlew :macrobenchmark:connectedCheck
```

## Artifact Folder

```bash
if [ -z "${ARTIFACT_DIR:-}" ]; then
  ARTIFACT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-android-perf.XXXXXX")"
fi
mkdir -p "$ARTIFACT_DIR"
```

Use the bundled helpers after a focused manual capture:

```bash
SKILL_DIR="<absolute path to this loaded skill folder>"
"$SKILL_DIR/scripts/simpleperf_hotspots.sh" \
  "$ARTIFACT_DIR/perf.data" \
  "$ARTIFACT_DIR" \
  --serial "$SERIAL" \
  --first-party-regex "$FIRST_PARTY_REGEX"

"$SKILL_DIR/scripts/heapprofd_reports.sh" \
  "$ARTIFACT_DIR/native-alloc.pftrace" \
  "$ARTIFACT_DIR"
```

## Report

Include:

- exact flow, target, Android version, build variant, compilation mode, and run count
- metric source and artifact paths
- startup, frame, CPU, or allocation evidence with units
- caveats such as emulator noise, low sample count, thermal state, missing symbols, or incomparable setup
- before/after delta only when captures are comparable

Do not infer wall-clock latency from CPU samples alone. Do not claim representative performance numbers from an emulator.
