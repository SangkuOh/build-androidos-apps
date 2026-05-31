# Build AndroidOS Apps Plugin

This Codex plugin packages modern Android development workflows for Kotlin,
Jetpack Compose, Material 3, Gradle, adb, emulator debugging, profiling, and memory
investigation.

## Included Skills

- `android-project-setup`
- `android-debugger-agent`
- `android-app-actions`
- `material3-adaptive-ui`
- `compose-ui-patterns`
- `compose-view-refactor`
- `compose-performance-audit`
- `android-runtime-performance`
- `android-memory-leaks`

## Design

The plugin mirrors the development roles covered by Build iOS Apps while using native
Android tooling and conventions:

- Gradle wrapper, Android Gradle Plugin, Kotlin, and Compose BOM for project setup
- adb, UI Automator, screenshots, and logcat for emulator or connected-device debugging
- Macrobenchmark, Baseline Profiles, Perfetto, Simpleperf, and gfxinfo for performance work
- Android Studio heap dumps, meminfo, optional Shark or LeakCanary, and heapprofd for memory work
- Material 3 adaptive layouts, edge-to-edge insets, large screens, and foldables for modern UI

## Requirements

The plugin intentionally uses Android SDK command-line tools instead of requiring a
third-party Android MCP server. Install Android Studio, the Android SDK, platform-tools,
and a bootable emulator or connected test device before running device workflows.

## Local Source

Clone the repository into a local plugin source directory and expose it through a Codex
marketplace entry. The plugin manifest is `.codex-plugin/plugin.json`.

```bash
git clone https://github.com/SangkuOh/build-androidos-apps.git
```
