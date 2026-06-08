---
name: android-memory-leaks
description: Capture and inspect Android memory evidence with dumpsys meminfo, Java or Kotlin heap dumps, Android Studio Profiler, optional Shark or LeakCanary analysis, and before-after comparison. Use when debugging retained activities, fragments, Compose state holders, contexts, listeners, callbacks, caches, native allocation growth, or unexplained memory pressure.
---

# Android Memory Leaks

## Overview

Prove leaks from a focused reproduction. Use `meminfo` to measure direction, heap dumps to identify retained objects and reference chains, and before-after captures to verify the specific retaining path disappeared.

Pair with `../android-debugger-agent/SKILL.md` to build, launch, and reproduce the flow. Pair with `../android-runtime-performance/SKILL.md` for native `heapprofd` allocation traces.

Read `references/memory-evidence.md` before interpreting captures.

## Core Workflow

1. Build and launch the exact variant.
2. Reproduce one flow that should release objects: navigate away, rotate, background and return, or close the feature.
3. Return to a stable idle state.
4. Capture `meminfo` and a heap dump.
5. Inspect retained app-owned types and their paths to GC roots.
6. Patch the smallest retaining edge.
7. Repeat the same flow and compare the same object types or paths.

## Capture

```bash
SKILL_DIR="<absolute path to this loaded skill folder>"
SERIAL="<adb-serial>"
PACKAGE="<application-id>"
ARTIFACT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-android-memory.XXXXXX")"

"$SKILL_DIR/scripts/capture_android_memory.sh" \
  --serial "$SERIAL" \
  --package "$PACKAGE" \
  --out-dir "$ARTIFACT_DIR" \
  --label after-flow
```

The helper captures a `dumpsys meminfo` snapshot and pulls an Android-format `.hprof`.

## Analyze

- Prefer Android Studio Profiler heap-dump analysis for class counts, retained size, fields, references, and Activity or Fragment leak filtering.
- Use Shark CLI when already installed or when a text report is useful for repeatable evidence.
- Use LeakCanary when the app already includes it or the user wants a debug-only instrumentation dependency.
- Use `hprof-conv` only when an external analyzer requires Java SE HPROF format.

Look for app-owned:

- destroyed `Activity` or detached `Fragment` instances
- retained `Context`, `View`, `Drawable`, bitmap, or Compose state holders
- listeners, callbacks, coroutines, flows, adapters, caches, and singleton references
- feature objects whose intended lifetime ended after leaving the flow

## Root-Cause Rules

- Treat one `meminfo` increase as a lead, not proof.
- Prove a leak with a retained object and a reference chain or a repeatable accumulation pattern.
- Separate expected process-lifetime caches from feature-lifetime leaks.
- Prefer removing the retaining edge over adding broad cleanup calls.
- Do not claim a fix because total memory dropped; confirm the specific retained type or path disappeared.

## Report

Include:

- exact reproduction flow, target, Android version, and variant
- artifact paths
- retained app-owned types and counts
- at least one reference chain or equivalent heap evidence
- the smallest applied fix
- before/after evidence for the same flow
