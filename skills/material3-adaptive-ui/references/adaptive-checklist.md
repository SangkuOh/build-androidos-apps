# Material 3 Adaptive Checklist

## Layout

- Base decisions on the current app window.
- Use compact, medium, and expanded window behavior deliberately.
- Prefer `NavigationSuiteScaffold`, `ListDetailPaneScaffold`, and `SupportingPaneScaffold` where they fit.
- Add useful information on expanded layouts instead of only increasing whitespace.
- Preserve continuity when resize, rotation, or foldable posture recreates UI.

## Insets

- Expect edge-to-edge on Android 15+ when targeting SDK 35+.
- Verify status bar, navigation bar, gesture area, cutout, and IME insets.
- Avoid applying both scaffold content padding and duplicate child padding.
- Keep tappable controls out of obscured areas.

## Interaction

- Verify back navigation in single-pane and multi-pane modes.
- Check keyboard tab order, directional navigation, mouse or trackpad operation, and stylus input when relevant.
- Preserve readable focus indicators and semantics.

## Official Docs

- Adaptive apps: `https://developer.android.com/develop/ui/compose/building-adaptive-apps`
- Window insets: `https://developer.android.com/develop/ui/compose/layouts/insets`
- Material 3 adaptive releases: `https://developer.android.com/jetpack/androidx/releases/compose-material3-adaptive`

At verification time on 2026-06-01, Compose Material 3 Adaptive had stable release `1.2.0`.
Re-check before pinning a dependency.
