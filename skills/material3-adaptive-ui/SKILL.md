---
name: material3-adaptive-ui
description: Implement and review modern Android Jetpack Compose UI with Material 3, edge-to-edge insets, adaptive layouts, window size classes, large-screen support, foldable posture handling, and accessible input behavior. Use when building or refining UI for phones, tablets, foldables, multi-window layouts, system bars, or Material 3 migrations.
---

# Material 3 Adaptive UI

## Overview

Build Android UI that adapts to the app window instead of assuming one phone-sized screen. Prefer native Material 3 and Compose adaptive APIs over custom layout frameworks.

Read `references/adaptive-checklist.md` before implementing a new screen or reviewing a large-screen issue.

## Workflow

### 1. Classify the screen

- Identify compact, medium, and expanded window behavior.
- Decide whether the screen needs one pane, list-detail panes, or a main pane with supporting content.
- Account for resize, rotation, foldable posture, font scaling, keyboard, mouse, trackpad, and stylus input when relevant.

### 2. Start with native scaffolds

- Use Material 3 `Scaffold` for top bars, bottom bars, snackbars, and content padding.
- Use `NavigationSuiteScaffold` when navigation should switch between bar and rail forms.
- Use `ListDetailPaneScaffold` for list-detail layouts.
- Use `SupportingPaneScaffold` when a secondary pane complements the main task.
- Use `currentWindowAdaptiveInfo()` when layout decisions depend on the current window configuration.

### 3. Handle edge-to-edge deliberately

- Expect edge-to-edge drawing when targeting SDK 35+ on Android 15+.
- Apply `WindowInsets` padding where content or actions would otherwise be obscured.
- Avoid stacking inset padding from both `Scaffold` and child content.
- Test gesture navigation, three-button navigation, display cutouts, and IME appearance.

### 4. Validate behavior

- Build after each meaningful UI slice.
- Resize, rotate, and navigate through compact and expanded layouts.
- Confirm back behavior across pane changes.
- Verify content descriptions, touch targets, focus traversal, and keyboard access for interactive controls.

## Strong Defaults

- Prefer stable adaptive library releases for production. Use alpha APIs only when the requested behavior requires them.
- Treat the current app window as the source of layout truth, not raw physical screen dimensions.
- Keep layout adaptation separate from business state.
- Preserve continuity through configuration changes with saveable UI state and screen-level state holders.
- Prefer Material theming and semantic roles over hard-coded colors.

## Review Checklist

- Insets are handled exactly once.
- Primary actions remain reachable behind system bars and IME.
- Expanded layouts add useful content rather than stretching phone UI.
- Navigation adapts coherently between bar, rail, and pane layouts.
- State survives window-size and posture changes.
- Accessibility labels and focus order still make sense in every layout.

Use current official Android documentation when adaptive APIs, release stability, or edge-to-edge requirements may have changed.
