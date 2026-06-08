---
name: android-debugger-agent
description: Build, install, run, inspect, and debug Android apps on emulators or connected devices with the Gradle wrapper, adb, UI Automator, screenshots, and logcat. Use when launching an app, reproducing a UI issue, interacting with an emulator, capturing logs, validating a feature flow, or diagnosing runtime behavior.
---

# Android Debugger Agent

## Overview

Use Android SDK command-line tools to prove behavior on a real adb target. Prefer a booted emulator for repeatable development work and a physical device when hardware, performance, or OEM behavior matters.

Pair with `../android-runtime-performance/SKILL.md` for profiling and `../android-memory-leaks/SKILL.md` for retained-memory investigations.

## Core Workflow

### 1. Discover the target

```bash
adb devices -l
```

Select one target explicitly with `SERIAL`. If no target is available, list AVDs with `emulator -list-avds`. Start an emulator only when the user asked for it or the task clearly requires launch.

### 2. Inspect the project

Find the application module, package id, build variants, and install tasks:

```bash
./gradlew tasks --all | rg 'assemble|install|connected.*AndroidTest'
```

Prefer repo documentation and existing tasks over inventing variant names.

### 3. Build and install

```bash
./gradlew :app:installDebug --console=plain
```

If the build fails, read the first actionable Gradle or compiler error, patch the root cause, and rebuild before attempting UI interaction.

### 4. Resolve and launch

```bash
PACKAGE="<application-id>"
SERIAL="<adb-serial>"
ACTIVITY="$(adb -s "$SERIAL" shell cmd package resolve-activity --brief "$PACKAGE" | tr -d '\r')"
adb -s "$SERIAL" shell am start -W -n "$ACTIVITY"
```

After launch, verify the visible state with a screenshot and a UI tree:

```bash
adb -s "$SERIAL" exec-out screencap -p > /tmp/android-screen.png
adb -s "$SERIAL" exec-out uiautomator dump /dev/tty > /tmp/android-ui.xml
```

### 5. Drive the UI

Compute tap coordinates from the UI tree rather than eyeballing screenshots:

```bash
SKILL_DIR="<absolute path to this loaded skill folder>"
python3 "$SKILL_DIR/scripts/ui_tree_summarize.py" /tmp/android-ui.xml /tmp/android-ui-summary.txt
python3 "$SKILL_DIR/scripts/ui_pick.py" /tmp/android-ui.xml "Settings"
adb -s "$SERIAL" shell input tap <x> <y>
```

Useful controls:

```bash
adb -s "$SERIAL" shell input swipe <x1> <y1> <x2> <y2> <duration-ms>
adb -s "$SERIAL" shell input text "hello"
adb -s "$SERIAL" shell input keyevent KEYCODE_BACK
```

Re-dump the UI tree after navigation or state changes. Use screenshots for visual confirmation.

### 6. Capture logs

```bash
adb -s "$SERIAL" logcat -c
PID="$(adb -s "$SERIAL" shell pidof -s "$PACKAGE" | tr -d '\r')"
adb -s "$SERIAL" logcat --pid "$PID"
adb -s "$SERIAL" logcat -b crash -d
```

Save the relevant excerpt and report the exact flow that produced it.

## Testing

Use the narrowest relevant Gradle task:

```bash
./gradlew :app:testDebugUnitTest
./gradlew :app:connectedDebugAndroidTest
```

For Compose UI tests, prefer semantic matchers and test tags over coordinate-only automation.

## Troubleshooting

- If `adb` is missing, check `$ANDROID_SDK_ROOT/platform-tools/adb` or `$HOME/Library/Android/sdk/platform-tools/adb`.
- If multiple devices are attached, pass `-s "$SERIAL"` on every adb command.
- If launch resolves the wrong activity, inspect the selected variant's `applicationId` and manifest merger output.
- If a UI node is missing, summarize the tree, scroll once when appropriate, re-dump, and search again.
- If logcat noise is high, clear logs immediately before reproduction and filter to the app pid.

Read `references/adb-cheatsheet.md` for additional commands.
