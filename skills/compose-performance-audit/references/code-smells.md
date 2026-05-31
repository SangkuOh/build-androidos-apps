# Compose Performance Code Smells

## State And Recomposition

- Reading broad screen state high in the tree when only a leaf needs one field.
- Hoisting fast-changing state farther than required.
- Passing mutable collections or unstable wrapper objects.
- Restarting effects because keys change on every composition.
- Writing state after reading it in the same composition path.

## Lazy Containers

- Missing stable item keys.
- Rebuilding mapped item collections during each composition.
- Heavy per-item formatting, parsing, image work, or dependency lookup.
- Nested scrolling structures without a clear measurement strategy.

## Computation

- Sorting, filtering, formatting, parsing, or allocation-heavy work in composable bodies.
- Using `derivedStateOf` everywhere without proving it reduces invalidation cost.
- Using `remember` with incomplete keys and returning stale values.

## Layout And Draw

- Deep modifier or layout chains on large lists.
- Intrinsic measurements in hot paths.
- Custom layout or draw work recalculated for every frame.
- Reading animation or scroll state during composition when a layout- or draw-phase read would suffice.

## Images

- Decoding full-resolution images for small thumbnails.
- Performing synchronous decode, transform, or I/O work on the main thread.
- Retaining large bitmaps beyond their intended UI lifetime.

## Investigation Order

1. Narrow state reads.
2. Stabilize list identity.
3. Remove composition-time heavy work.
4. Check effects and lifecycle collection.
5. Inspect layout and draw work.
6. Capture Macrobenchmark or Perfetto evidence.

Official performance guide:
`https://developer.android.com/develop/ui/compose/performance`
