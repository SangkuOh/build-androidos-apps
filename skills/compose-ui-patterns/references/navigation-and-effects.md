# Navigation And Effects

## Navigation

- Keep navigation ownership near the app shell or route boundary.
- Pass callbacks to leaf composables instead of passing the navigation controller through the tree.
- Model deep-link destinations with the same routing types used by in-app navigation.
- Preserve back-stack expectations for cold-start inbound links.
- Re-check current Navigation Compose guidance before introducing new navigation APIs.

## Flow Collection

- Collect screen UI state with lifecycle awareness.
- Keep one clear immutable UI-state stream when practical.
- Separate one-off UI events from persistent render state.

## Effects

Use controlled APIs for work tied to composition:

- `LaunchedEffect` for suspend work whose lifecycle follows keys.
- `DisposableEffect` for subscribe and unsubscribe lifecycles.
- `SideEffect` only for publishing Compose state to non-Compose code after successful composition.
- `rememberUpdatedState` when a long-lived effect needs the latest callback without restarting.

Check effect keys carefully. Repeated restarts can duplicate work or degrade responsiveness.

Official docs:

- Side effects: `https://developer.android.com/develop/ui/compose/side-effects`
- Navigation: `https://developer.android.com/develop/ui/compose/navigation`
