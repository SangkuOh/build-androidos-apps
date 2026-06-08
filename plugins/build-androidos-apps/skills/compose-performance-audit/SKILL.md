---
name: compose-performance-audit
description: Audit Jetpack Compose runtime performance from code first, then guide focused profiling. Use when diagnosing slow rendering, janky scrolling, excessive recomposition, unstable parameters, expensive layout or draw work, image pressure, frame drops, or unnecessary state invalidation in Compose UI.
---

# Compose Performance Audit

## Overview

Start with code and state-flow inspection. Request or capture runtime evidence when code review alone cannot explain the symptom. Pair with `../android-runtime-performance/SKILL.md` for Macrobenchmark, Perfetto, Simpleperf, and frame-stat captures.

Read:

- `references/code-smells.md` for the detailed review catalog.
- `references/profiling-intake.md` before collecting traces.
- `references/report-template.md` when presenting findings.

## Workflow

1. Classify the symptom: startup latency, scroll jank, frame drops, high CPU, excessive recomposition, slow input response, image pressure, or memory growth.
2. Inspect the affected composables, state owners, lazy containers, modifiers, and data transformations.
3. Identify code-backed suspects and separate them from hypotheses.
4. Apply narrow fixes when the cause is clear.
5. Capture the same focused flow with Macrobenchmark or Perfetto when runtime proof is needed.
6. Compare the same device, build variant, flow, and compilation mode before and after.

## Code-First Review

Focus on:

- broad state reads that invalidate large trees
- state hoisted farther than its consumers require
- unstable parameters or mutable collections
- missing lazy-list keys
- heavy sorting, filtering, mapping, parsing, or formatting during composition
- backwards writes and repeated effect restarts
- layout work caused by unnecessary nesting or intrinsic measurements
- draw-phase work, oversized images, and synchronous decode or resize paths
- reading rapidly changing state too early instead of deferring it to layout or draw when appropriate

## Remediation Rules

- Narrow observation scope before adding memoization.
- Move expensive work out of composition and recompute only when real inputs change.
- Use `remember` and `derivedStateOf` only when they reduce work and their keys are correct.
- Stabilize models and callbacks where evidence shows skipped recomposition is blocked.
- Add item keys before attempting larger list rewrites.
- Downsample images before rendering.
- Prefer release-like, profileable builds for meaningful timing.

## Verification

Report:

- exact flow, target, Android version, build variant, and run count
- code findings with file references
- trace-backed evidence separately from code suspicion
- before/after metrics when a fix was applied
- remaining uncertainty and the next smallest useful capture

Do not claim improvement from emulator feel alone. Use repeatable evidence.
