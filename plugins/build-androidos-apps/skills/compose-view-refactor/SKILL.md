---
name: compose-view-refactor
description: Refactor large Jetpack Compose screens into stable, testable composables with explicit state ownership and event flow. Use when splitting oversized composable files, removing inline business logic, tightening ViewModel boundaries, stabilizing lazy-list identity, reducing CompositionLocal misuse, or cleaning up side effects without changing behavior.
---

# Compose View Refactor

## Overview

Refactor Compose screens toward small rendering functions, explicit events, and predictable state ownership. Keep behavior intact unless the user requests a product change.

Read `references/refactor-checklist.md` for a focused review pass.

## Core Guidelines

### 1. Separate screen wiring from reusable content

Use a route-level composable to obtain the `ViewModel`, collect state, and wire navigation. Pass plain values and callbacks into reusable screen content.

```kotlin
@Composable
fun SearchRoute(
    onOpenResult: (String) -> Unit,
    viewModel: SearchViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    SearchScreen(
        uiState = uiState,
        onQueryChange = viewModel::updateQuery,
        onOpenResult = onOpenResult,
    )
}
```

### 2. Extract meaningful composable types

- Split long bodies by user-visible section or reuse boundary.
- Pass only the data and callbacks a child needs.
- Keep helpers small; do not hide an entire screen behind many private rendering functions with unclear ownership.
- Add previews to extracted components when their states matter independently.

### 3. Move work out of composition

- Move repository calls and domain decisions into models or services.
- Precompute expensive mapping, filtering, and formatting when inputs change.
- Use `LaunchedEffect`, `remember`, and `derivedStateOf` only for their intended lifecycle semantics.
- Avoid backwards writes that mutate state after it has been read in the same composition.

### 4. Tighten state ownership

- Keep simple element state local.
- Use plain state holders for reusable UI logic.
- Use screen-level `ViewModel` state for business logic.
- Avoid introducing a `ViewModel` for every component.

### 5. Stabilize lazy content

- Provide stable keys for lazy items.
- Pass immutable or stable data models where practical.
- Avoid creating changing collections, wrappers, or lambdas unnecessarily in hot list paths.

## Workflow

1. Capture the existing behavior and build state.
2. Identify route wiring, business logic, state ownership, and visual sections.
3. Extract screen content from route wiring.
4. Remove non-trivial inline actions and composition-time work.
5. Split meaningful sections and narrow child inputs.
6. Stabilize list keys and frequently changing parameters.
7. Run the relevant build and tests.
8. Verify the same emulator flow when behavior is user-visible.

## Guardrails

- Do not introduce a new architecture layer solely to shorten a file.
- Do not change navigation semantics during a layout-only refactor.
- Do not move state farther from its consumers without a lifecycle or sharing reason.
- Do not replace explicit parameters with a broad `CompositionLocal` dependency bag.
- Do not claim a performance win without measuring when performance was the stated goal.
