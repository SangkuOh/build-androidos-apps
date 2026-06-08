# Compose State And Architecture

## State Placement

Use the smallest owner that matches the state lifetime and logic:

| State kind | Default owner |
| --- | --- |
| Simple element state used by one composable | Local `remember` |
| UI state that must survive activity recreation when saveable | `rememberSaveable` |
| Complex reusable UI logic | Plain state holder remembered by the UI |
| Screen state driven by business or data-layer logic | Screen-level `ViewModel` exposing immutable `uiState` |

Hoist state to the lowest common ancestor of readers and writers. Keep state as close to its
consumers as practical.

## ViewModel Guidance

- Keep `ViewModel` instances at screen, destination, or navigation-graph boundaries.
- Expose immutable UI state, usually through `StateFlow`.
- Use coroutines and flows for data-layer interaction.
- Do not retain `Activity`, `Fragment`, `Context`, `Resources`, or lifecycle types in a `ViewModel`.
- Do not use a `ViewModel` inside a reusable leaf component solely to avoid parameters.

## Reusable UI

- Pass the current value and explicit event callbacks.
- Prefer property drilling over opaque wrapper bags when it keeps responsibilities visible.
- Pass only what a child needs.
- Use immutable collections or observable holders. Mutating a plain mutable list does not reliably trigger recomposition.

## Official Docs

- State: `https://developer.android.com/develop/ui/compose/state`
- State hoisting: `https://developer.android.com/develop/ui/compose/state-hoisting`
- Architecture recommendations: `https://developer.android.com/topic/architecture/recommendations`
