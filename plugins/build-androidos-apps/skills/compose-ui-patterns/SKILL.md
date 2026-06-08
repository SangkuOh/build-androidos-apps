---
name: compose-ui-patterns
description: Build and refactor Android UI with practical Jetpack Compose patterns for state hoisting, unidirectional data flow, screen-level ViewModels, StateFlow collection, navigation, side effects, previews, lists, forms, accessibility, and testing. Use when shaping Compose screens, components, app navigation, state ownership, or async UI behavior.
---

# Compose UI Patterns

## Overview

Build Compose UI as a stable rendering layer: immutable state goes down, explicit events go up, and business logic stays outside reusable composables. Follow the repo's existing conventions where they are coherent.

Read references as needed:

- `references/state-and-architecture.md` for state ownership and screen-level `ViewModel` guidance.
- `references/navigation-and-effects.md` for navigation, lifecycle collection, and effect APIs.
- `references/components-index.md` for component-specific implementation notes.

## Workflow For A New Screen

1. Define the screen state, user events, navigation events, and minimum SDK assumptions.
2. Place business state in a screen-level `ViewModel` when domain or data-layer work is involved.
3. Keep simple element state close to the composable with `remember` or `rememberSaveable`.
4. Expose immutable state and explicit callbacks to reusable child composables.
5. Collect flows with lifecycle awareness.
6. Model loading, empty, content, and error states explicitly.
7. Add previews for meaningful visual states and UI tests for critical interactions.
8. Build and verify before broad call-site changes.

## Core Guidelines

### State ownership

- Hoist state to the lowest common owner that reads and writes it.
- Use a screen-level `ViewModel` for business state and data-layer coordination.
- Use plain state holders for reusable components with complex UI logic.
- Avoid passing `Activity`, `Fragment`, `Context`, `Resources`, or lifecycle objects into a `ViewModel`.

### Rendering

- Keep composables side-effect free.
- Trigger work from controlled effect APIs such as `LaunchedEffect`, not directly during composition.
- Use stable item keys for lazy lists.
- Move parsing, sorting, filtering, and formatting out of frequently recomposed code paths when they are non-trivial.

### Dependencies

- Pass explicit inputs and callbacks to reusable composables.
- Use dependency injection or app-level owners for services.
- Use `CompositionLocal` narrowly for tree-scoped concerns such as theme or design-system infrastructure, not as a default service locator.

### Accessibility

- Add content descriptions where visual meaning is not otherwise exposed.
- Preserve semantic grouping, focus order, and touch-target sizing.
- Add test tags only where semantic matchers are insufficient or a stable test contract is useful.

## Anti-Patterns

- Calling repositories or network clients directly from composable bodies.
- Hoisting every toggle and animation flag into a `ViewModel`.
- Passing one giant screen-state object into every leaf composable.
- Using unstable list identity.
- Adding wrapper event bags that hide a reusable component's actual responsibilities.
- Using navigation controllers deep in leaf UI when callbacks are sufficient.

Use web search to consult current Android Developers documentation when Compose, lifecycle, or navigation APIs may have changed.
