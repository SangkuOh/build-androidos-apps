# adb Cheatsheet

## SDK Discovery

```bash
command -v adb
printf '%s\n' "${ANDROID_SDK_ROOT:-}" "${ANDROID_HOME:-}" "$HOME/Library/Android/sdk"
```

## Devices And Emulators

```bash
adb devices -l
emulator -list-avds
adb -s <serial> shell getprop ro.build.version.release
adb -s <serial> shell getprop ro.build.version.sdk
adb -s <serial> shell wm size
```

## Package And Activity

```bash
adb -s <serial> shell pm list packages | rg <fragment>
adb -s <serial> shell cmd package resolve-activity --brief <package>
adb -s <serial> shell am force-stop <package>
adb -s <serial> shell monkey -p <package> 1
adb -s <serial> shell dumpsys package <package>
```

## Screenshots And UI Trees

```bash
adb -s <serial> exec-out screencap -p > /tmp/android-screen.png
adb -s <serial> exec-out uiautomator dump /dev/tty > /tmp/android-ui.xml
```

UI Automator does not expose every custom-drawn element. When a Compose control is missing,
check its semantics and accessibility configuration, then use a Compose UI test for a stable
automated contract.

## Logs

```bash
adb -s <serial> logcat -c
adb -s <serial> shell pidof -s <package>
adb -s <serial> logcat --pid <pid>
adb -s <serial> logcat -b crash -d
adb -s <serial> shell dumpsys activity processes
```

## Intents

```bash
adb -s <serial> shell am start -W -a android.intent.action.VIEW -d <uri> <package>
adb -s <serial> shell am broadcast -a <action>
```

Always include `-s <serial>` when more than one adb target is connected.
