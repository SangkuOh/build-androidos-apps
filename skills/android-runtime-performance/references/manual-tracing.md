# Manual Android Tracing

Use a run-specific output directory:

```bash
ARTIFACT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-android-perf.XXXXXX")"
SERIAL="<adb-serial>"
PACKAGE="<application-id>"
```

## gfxinfo

Use for a quick frame snapshot:

```bash
adb -s "$SERIAL" shell dumpsys gfxinfo "$PACKAGE" reset
# Perform one focused flow.
adb -s "$SERIAL" shell dumpsys gfxinfo "$PACKAGE" > "$ARTIFACT_DIR/gfxinfo.txt"
adb -s "$SERIAL" shell dumpsys gfxinfo "$PACKAGE" framestats > "$ARTIFACT_DIR/gfxinfo-framestats.txt"
```

Treat emulator frame numbers as directional only.

## Perfetto

Use Perfetto for timeline analysis. Prefer a repo-specific config if one exists. For a light
manual trace:

```bash
TRACE_BASENAME="app-flow-$(date +%Y%m%d-%H%M%S).pftrace"
TRACE_DEVICE="/data/misc/perfetto-traces/$TRACE_BASENAME"

adb -s "$SERIAL" shell perfetto \
  --background-wait \
  -o "$TRACE_DEVICE" \
  -t 30s \
  --app "$PACKAGE" \
  sched freq idle am wm gfx view binder_driver hal dalvik

# Perform one focused flow and wait for the trace to finish.
adb -s "$SERIAL" pull "$TRACE_DEVICE" "$ARTIFACT_DIR/$TRACE_BASENAME"
```

Inspect main-thread work, frame timeline lanes when present, render-thread activity, binder
transactions, scheduler gaps, locks, and app `Trace` sections. Do not claim a track exists unless
the captured trace actually contains it.

## Simpleperf

Use for sampled CPU stacks on a debuggable or profileable app:

```bash
adb -s "$SERIAL" shell rm -f /data/local/tmp/perf.data
adb -s "$SERIAL" shell simpleperf record \
  --app "$PACKAGE" \
  -o /data/local/tmp/perf.data \
  -e cpu-clock -f 4000 -g \
  --duration 60

# Perform one focused flow while recording.
adb -s "$SERIAL" pull /data/local/tmp/perf.data "$ARTIFACT_DIR/perf.data"
```

Analyze:

```bash
SKILL_DIR="<absolute path to this loaded skill folder>"
FIRST_PARTY_REGEX="$(printf '%s' "$PACKAGE" | sed 's/\./\\./g')"
"$SKILL_DIR/scripts/simpleperf_hotspots.sh" \
  "$ARTIFACT_DIR/perf.data" \
  "$ARTIFACT_DIR" \
  --serial "$SERIAL" \
  --first-party-regex "$FIRST_PARTY_REGEX"
```

Simpleperf samples CPU execution. It does not directly explain suspended coroutine waits,
network latency, or lock waits. Pair it with Perfetto for those questions.
