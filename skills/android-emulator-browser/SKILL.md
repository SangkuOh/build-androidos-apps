---
name: android-emulator-browser
description: Mirror an Android emulator or connected adb device into the Codex in-app browser with adb screenshots and input forwarding. Use when a user wants to watch or interact with an Android app in the browser, capture browser-visible emulator proof, or keep an Android preview visible inside Codex while iterating on a Compose UI.
---

# Android Emulator Browser

## Browser Workflow

Use this workflow when the user wants an Android app or emulator preview inside
the Codex in-app browser.

1. Select one explicit adb target:

   ```bash
   adb devices -l
   emulator -list-avds
   ```

   If no device is booted, start an emulator through the normal Android
   debugger workflow before opening the browser mirror.

2. Build, install, and launch the target app before mirroring unless the user
   only wants to inspect the current emulator state:

   ```bash
   ./gradlew :app:installDebug --console=plain
   adb -s "<adb-serial>" shell monkey -p "<application-id>" 1
   ```

3. Start the bundled Android browser bridge in a long-running terminal:

   ```bash
   SERIAL="<adb-serial>"
   node <skill-root>/scripts/android-emulator-browser.mjs --serial "$SERIAL"
   ```

   The bridge prints a local URL such as `http://127.0.0.1:3277`. Keep this
   terminal alive while the browser mirror is in use.

4. Open the exact local URL printed by the bridge in the Codex in-app browser.

5. Verify that a real Android frame is rendering before reporting success. A
   loaded page alone is not proof that the emulator stream is healthy.

## Interaction

- Clicks on the rendered Android frame are forwarded through
  `adb shell input tap`.
- The page includes Back, Home, Enter, Refresh, and text-entry controls.
- Browser wheel gestures over the frame are translated into adb swipes.
- For precise debugging, keep using UI Automator dumps and app-pid logcat from
  `../android-debugger-agent/SKILL.md`; the browser bridge is visual proof and
  light interaction, not a replacement for structural inspection.

## Support Boundary

- Current `serve-sim` releases are Apple Simulator-oriented. For Android, use
  the bundled adb-based browser bridge above rather than calling `serve-sim`
  directly against an adb serial.
- The bridge supports booted Android emulators and connected devices that
  accept `adb exec-out screencap -p` and `adb shell input ...` commands.
- Hardware-specific behavior still needs a physical device when representative
  input, rendering, performance, sensors, camera, or OEM behavior matters.
- Android Studio Compose Preview is not a runtime adb surface. To preview a
  composable in Codex, launch a sample, debug, or preview-host activity that
  renders that composable, then mirror that running app through this workflow.

## Proof

For browser or preview QA, capture a browser screenshot showing the Android
frame. If the task involved UI interaction, also report the adb serial, app
variant, launched package/activity, and the replayed flow.
