# Compose Refactor Checklist

## Before Editing

- Build the current target or record the existing failure.
- Identify route-level wiring, state owners, side effects, navigation callbacks, and visual sections.
- Read nearby files to preserve local naming and architecture conventions.

## Refactor Pass

- Split route wiring from reusable screen content.
- Move repository calls and domain decisions out of composables.
- Keep element state local unless another owner needs it.
- Keep `ViewModel` instances at screen or destination boundaries.
- Extract meaningful sections into dedicated composables.
- Narrow child parameters.
- Add stable keys to lazy items.
- Remove broad `CompositionLocal` usage that hides feature dependencies.
- Check effect keys and cancellation.

## Verification

- Run the narrow build and relevant tests.
- Exercise the same emulator flow for user-visible refactors.
- Compare screenshots when layout must stay unchanged.
- Use the performance-audit skill when the refactor targets jank or recomposition.

## Stop Conditions

Stop and explain the tradeoff before:

- changing navigation behavior
- introducing a new architecture layer
- raising `minSdk`
- replacing a stable dependency stack
- merging product changes into a structural cleanup
