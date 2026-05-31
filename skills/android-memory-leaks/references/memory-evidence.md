# Android Memory Evidence

## Evidence Ladder

1. Use `dumpsys meminfo` for directional process memory and object-count snapshots.
2. Use a heap dump for retained Kotlin and Java objects.
3. Use Android Studio Profiler to inspect class counts, retained sizes, fields, references, and likely Activity or Fragment leaks.
4. Use Shark CLI or existing LeakCanary reports when available for text reference chains.
5. Use Perfetto `heapprofd` when the problem is native allocation growth.

## Reproduction Patterns

- Enter and leave the same feature repeatedly.
- Rotate between portrait and landscape while the feature is active.
- Background and foreground the app.
- Open and dismiss dialogs, sheets, media, camera, or map screens.
- Navigate across a route expected to release a screen-level owner.

Return to the same stable idle point before each capture.

## Interpretation Rules

- `meminfo` describes a process snapshot; it does not identify GC-root retention paths.
- Heap dumps are strongest when the retained type should have died and the path to a GC root is explainable.
- Android Studio leak filters can produce false positives. Validate intended lifetime.
- Compare the same flow and object type before and after the patch.
- Separate Java or Kotlin retention from native allocation behavior.

## Common Retainers

- singleton or process-scope caches holding activity-scoped values
- listeners and callbacks not removed at lifecycle end
- coroutines or flows with an owner that outlives the screen
- adapters, fragments, views, or drawables retained after navigation
- large bitmap caches with unclear eviction
- Compose state holders retained through a longer-lived owner

## Official Docs

- Heap dump and memory profiler: `https://developer.android.com/studio/profile/memory-profiler`
- Memory management: `https://developer.android.com/topic/performance/memory-overview`

Use `hprof-conv` from SDK platform-tools only when an external analyzer requires Java SE HPROF.
