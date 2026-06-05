# Build AndroidOS Apps

`Build AndroidOS Apps` is a Codex plugin for modern Android application
development with Kotlin, Jetpack Compose, Material 3, Gradle, adb, visible
Codex side-panel emulator previews, performance profiling, and memory
investigation.

The plugin organizes each development responsibility around Android-native
tools and conventions.

## What This Plugin Is

This repository is a Codex plugin, not an Android Studio project template and
not a replacement for the Android SDK.

When a request matches one or more included skills, Codex loads the relevant
workflow instructions and applies them to the current repository. The plugin is
designed to help Codex:

- inspect an existing Gradle build before editing it
- preserve the repository's architecture and dependency conventions
- create or modernize Kotlin and Jetpack Compose projects conservatively
- build Material 3 adaptive UI for phones, tablets, foldables, and multi-window
  layouts
- expose shortcuts, deep links, App Links, and App Actions through a coherent
  routing model
- build, install, launch, inspect, and debug apps on an explicit adb target
- mirror a booted Android emulator or device into the visible Codex side-panel
  browser for visual preview and light interaction
- audit Compose code before collecting runtime performance traces
- choose Macrobenchmark, Baseline Profiles, Perfetto, Simpleperf, or `gfxinfo`
  according to the question
- distinguish Java or Kotlin heap retention from native memory growth
- validate changes with the narrowest useful Gradle tasks and device flows

The plugin intentionally does not require a third-party Android MCP server.
Device work uses the Gradle wrapper, Android SDK command-line tools, adb,
UI Automator, and Android profiling tools.

## How It Works

The plugin uses progressive skill loading.

1. Codex reads the request and matches it against the descriptions of the
   included skills.
2. It loads only the relevant `SKILL.md` files.
3. A selected skill may load a focused reference document or bundled helper
   script when the task needs more detail.
4. Codex inspects the target repository and follows its existing conventions.
5. It implements the smallest justified change.
6. It runs focused verification, then broadens checks when shared behavior or
   a platform boundary changed.
7. For runtime bugs, it reproduces the same flow after the patch and reports
   the target, variant, evidence, and remaining caveats.

A single task can activate more than one skill. For example:

- a new large-screen settings flow can use `compose-ui-patterns`,
  `material3-adaptive-ui`, and `android-project-setup`
- a janky scrolling issue can use `compose-performance-audit`,
  `android-runtime-performance`, `android-debugger-agent`, and
  `android-emulator-browser` for browser-visible proof
- a retained activity can use `android-memory-leaks` and
  `android-debugger-agent`
- an Assistant entry point can use `android-app-actions` and the project's
  existing navigation layer

## Current Release

`v0.1.2` makes the Android browser mirror explicitly side-panel visible. The
`android-emulator-browser` helper now prints the exact URL to open in the
visible Codex side-panel browser, and the skill requires browser visibility
before reporting preview success.

## Included Skills

### `android-project-setup`

Set up or modernize Android projects with current Kotlin, Compose, Material 3,
and Gradle conventions.

Use it for:

- new Android apps and modules
- Kotlin DSL and version catalogs
- Android Gradle Plugin upgrades
- AGP 9 built-in Kotlin migration
- Compose Compiler plugin and Compose BOM setup
- Material 3 dependencies
- Gradle wrapper and JDK compatibility
- `compileSdk`, `targetSdk`, and `minSdk` decisions
- KSP or kapt migration
- build-tool compatibility repairs

Strong defaults:

- inspect `settings.gradle.kts`, module build files, version catalogs, wrapper
  configuration, and existing modules before editing
- use the checked-in `./gradlew` wrapper
- keep dependency versions centralized when the repository already uses a
  version catalog
- use stable dependencies for production unless a requested API requires a
  preview artifact
- prefer KSP over kapt when the dependency supports it
- keep `minSdk` tied to product requirements
- re-check official Android documentation before making version-sensitive
  claims

For AGP 9 and later, the skill accounts for built-in Kotlin before applying or
retaining `org.jetbrains.kotlin.android`. A build migration is kept separate
from unrelated feature work.

### `android-debugger-agent`

Build, install, launch, inspect, and debug Android apps on an explicit adb
target.

Use it for:

- discovering emulators and connected devices
- selecting a build variant
- building and installing an app
- resolving and launching the target activity
- capturing screenshots and UI trees
- computing UI interaction coordinates from accessibility nodes
- driving a repeatable emulator flow
- collecting filtered logcat and crash logs
- validating user-visible fixes

The workflow starts by selecting one target explicitly:

```bash
adb devices -l
emulator -list-avds
```

It then discovers repository tasks and installs the requested variant:

```bash
./gradlew tasks --all
./gradlew :app:installDebug --console=plain
```

For runtime interaction, it captures visual and structural evidence:

```bash
adb -s <serial> exec-out screencap -p > /tmp/android-screen.png
adb -s <serial> exec-out uiautomator dump /dev/tty > /tmp/android-ui.xml
```

Strong defaults:

- pass `-s <serial>` on adb commands when more than one target is attached
- fix the first actionable build error before attempting UI interaction
- re-dump the UI tree after navigation or state changes
- prefer Compose semantic matchers and test tags for stable automated UI tests
- use a physical device when hardware, OEM behavior, or representative
  performance matters

### `android-emulator-browser`

Mirror a booted Android emulator or connected adb device into the visible Codex
side-panel browser.

Use it for:

- keeping an Android runtime preview visible inside Codex
- interacting with an emulator through browser clicks, key buttons, and text
  input
- capturing browser-visible proof after UI changes
- reviewing Compose UI in a running preview, sample, debug, or host activity
- pairing visual preview with `android-debugger-agent` screenshots, UI trees,
  and logcat

The workflow follows the same operational shape as the latest iOS simulator
browser skill:

```bash
adb devices -l
SERIAL="<adb-serial>"
node skills/android-emulator-browser/scripts/android-emulator-browser.mjs \
  --serial "$SERIAL"
```

Open the exact local URL printed by the bridge in the visible Codex side-panel
browser and confirm that a real Android frame is rendering before reporting
success.

Strong defaults:

- select one adb serial explicitly when multiple targets are attached
- build, install, and launch the app before mirroring unless the current device
  state is the target
- keep the bridge terminal alive while the preview is open
- treat the browser bridge as visual proof and light interaction; use UI
  Automator and logcat for structural debugging
- use a physical device for hardware-specific behavior

Current `serve-sim` releases are Apple Simulator-oriented. For Android browser
previews, this plugin provides a bundled adb-based bridge instead of calling
`serve-sim` directly against an adb serial.

### `android-app-actions`

Expose useful app destinations and actions outside the main UI.

Use it for:

- deep links
- verified Android App Links
- static launcher shortcuts
- dynamic or pinned shortcuts
- Google Assistant App Actions
- `shortcuts.xml` capabilities
- external intent routing
- cold-start and warm-start destination validation

The workflow starts with the smallest user-facing verbs and destinations:

- open
- search
- compose
- continue
- create
- record
- inspect

Strong defaults:

- expose a small, high-value surface instead of mirroring the full navigation
  tree
- route shortcuts, links, notifications, widgets, and in-app actions through
  one destination or domain-command model
- validate and sanitize inbound URI parameters
- use App Actions only when a supported Assistant built-in intent or justified
  custom intent maps cleanly to the feature
- verify runtime fulfillment instead of stopping after XML compilation

### `material3-adaptive-ui`

Build modern Material 3 Compose UI that responds to the current app window.

Use it for:

- phone, tablet, foldable, and multi-window layouts
- compact, medium, and expanded window behavior
- Material 3 `Scaffold`
- `NavigationSuiteScaffold`
- `ListDetailPaneScaffold`
- `SupportingPaneScaffold`
- `currentWindowAdaptiveInfo()`
- edge-to-edge drawing and `WindowInsets`
- system bars, display cutouts, and IME behavior
- keyboard, mouse, trackpad, stylus, and accessibility review

Strong defaults:

- use the current app window as the source of layout truth
- keep adaptation separate from business state
- add useful structure in expanded layouts instead of stretching phone UI
- apply insets exactly once
- preserve state and back behavior across window-size and posture changes
- verify gesture navigation, three-button navigation, cutouts, and IME
  appearance where relevant

The skill expects edge-to-edge behavior to be reviewed deliberately when
targeting modern Android SDK levels.

### `compose-ui-patterns`

Build Compose UI as a stable rendering layer with explicit state ownership.

Use it for:

- new screens and reusable composables
- state hoisting
- screen-level ViewModels
- lifecycle-aware `StateFlow` collection
- unidirectional data flow
- navigation and controlled side effects
- forms, lazy lists, dialogs, sheets, and async content
- previews, semantics, accessibility, and UI tests

The default state model is:

| State kind | Default owner |
| --- | --- |
| Simple element state used by one composable | Local `remember` |
| Saveable UI state | `rememberSaveable` |
| Complex reusable UI behavior | Plain state holder remembered by the UI |
| Screen state driven by business or data-layer logic | Screen-level `ViewModel` exposing immutable UI state |

Strong defaults:

- immutable state flows down and explicit events flow up
- business logic stays outside reusable composables
- repository and network calls do not run directly from composable bodies
- leaf composables receive plain values and callbacks
- flow collection is lifecycle aware
- lazy collections use stable keys
- `CompositionLocal` is used narrowly for tree-scoped infrastructure rather
  than as a default service locator

### `compose-view-refactor`

Refactor large Compose screens without changing user-visible behavior.

Use it for:

- oversized composable files
- route wiring mixed with reusable rendering
- inline business logic
- broad or unclear state ownership
- missing lazy-list keys
- unstable parameters
- overused `CompositionLocal`
- composition-time parsing, sorting, filtering, or formatting
- repeated effect restarts

The workflow separates route-level wiring from reusable screen content:

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

Strong defaults:

- extract meaningful composables instead of hiding an entire screen behind
  many private rendering helpers
- pass only the data and callbacks a child needs
- keep simple element state local
- avoid introducing a ViewModel for every component
- move repository calls and expensive transformations out of composition
- do not claim a performance improvement without measurement when performance
  is the stated goal

### `compose-performance-audit`

Audit Compose performance from code before collecting traces.

Use it for:

- scroll jank
- frame drops
- excessive recomposition
- broad state invalidation
- unstable parameters
- lazy-list identity issues
- expensive composition-time transformations
- effect restart loops
- intrinsic measurement and layout cost
- draw-phase work
- oversized images and synchronous decode paths

The investigation order is:

1. Narrow broad state reads.
2. Stabilize lazy-list identity.
3. Remove heavy work from composition.
4. Check effects and lifecycle-aware collection.
5. Inspect layout and draw cost.
6. Capture Macrobenchmark or Perfetto evidence when runtime proof is needed.

Strong defaults:

- narrow observation scope before adding memoization
- use `remember` and `derivedStateOf` only when they reduce real work and have
  correct keys
- downsample images before rendering
- separate code-backed findings from trace-backed evidence
- do not claim improvement from emulator feel alone

### `android-runtime-performance`

Capture and interpret focused Android runtime performance evidence.

Use it for:

- startup latency
- frame timing and jank
- scrolling and animation performance
- CPU-heavy Kotlin, Java, native, or framework stacks
- before-and-after optimization comparisons
- Baseline Profile generation
- scheduler stalls, binder work, locks, and timeline analysis
- native allocation growth

Choose the evidence source according to the question:

| Tool | Best fit |
| --- | --- |
| Macrobenchmark | Repeatable app-level startup, frame, scrolling, animation, and interaction metrics |
| Baseline Profiles | Precompile important startup and interaction paths that users feel immediately |
| Perfetto | Timeline root cause, frame lanes, scheduler gaps, main-thread stalls, binder work, locks, and trace sections |
| Simpleperf | Sampled Kotlin, Java, native, and framework CPU stacks |
| `gfxinfo framestats` | Fast directional frame snapshot before deeper tracing |
| `heapprofd` | Native allocation traces when Java or Kotlin heap analysis is not enough |

Strong defaults:

- profile one user-visible flow with exact start and stop points
- record device, Android version, variant, build type, compilation mode, and
  run count
- benchmark a `profileable` target variant
- prefer a physical device for representative numbers
- treat emulator measurements as workflow rehearsal or coarse direction
- preserve JSON and trace artifacts from the exact run
- compare only equivalent captures

### `android-memory-leaks`

Investigate retained objects and native allocation growth with repeatable
evidence.

Use it for:

- retained activities and fragments
- Compose state holders
- contexts, views, drawables, and bitmaps
- listeners and callbacks
- coroutines and flows
- adapters and caches
- singleton retention
- native allocation growth
- unexplained memory pressure

The evidence ladder is:

1. Use `dumpsys meminfo` for directional process memory and object counts.
2. Capture an Android-format HPROF heap dump.
3. Inspect class counts, retained sizes, fields, and references with Android
   Studio Profiler.
4. Use Shark CLI or existing LeakCanary reports when a text reference chain is
   useful.
5. Use Perfetto `heapprofd` for native allocation growth.

Strong defaults:

- return to the same idle point before each capture
- treat one `meminfo` increase as a lead, not proof
- prove a leak with a retained object and GC-root path or a repeatable
  accumulation pattern
- distinguish process-lifetime caches from feature-lifetime leaks
- remove the retaining edge instead of adding broad cleanup calls
- confirm that the same retained type or path disappears after the patch

## Common Workflows

### Create Or Modernize A Compose Project

Example prompt:

```text
Create an Android app with Kotlin, Jetpack Compose, Material 3, a version
catalog, and the current AGP built-in Kotlin conventions.
```

Expected workflow:

1. Load `android-project-setup`.
2. Inspect the existing build or scaffold the requested modules.
3. Re-check official AGP, Compose BOM, Kotlin, SDK, and JDK guidance.
4. Configure the smallest necessary Gradle surface.
5. Run `./gradlew help`, a debug assembly, and relevant tests or lint tasks.

### Build An Adaptive Material 3 Screen

Example prompt:

```text
Refactor this list-detail screen for phones, tablets, foldables, and
multi-window mode. Preserve state while switching between one and two panes.
```

Expected workflow:

1. Load `material3-adaptive-ui`, `compose-ui-patterns`, and possibly
   `compose-view-refactor`.
2. Define compact, medium, and expanded behavior.
3. Choose native adaptive scaffolds where they fit.
4. Handle insets exactly once.
5. Verify resize, rotation, posture, back behavior, IME, focus, and
   accessibility.

### Debug A Runtime Failure

Example prompt:

```text
Launch the debug app on the emulator, reproduce the login crash, and inspect
the filtered logcat output.
```

Expected workflow:

1. Load `android-debugger-agent`.
2. Select one adb serial and discover the correct install task.
3. Build and install before UI interaction.
4. Resolve the launcher activity and capture the initial screenshot and UI
   tree.
5. Reproduce the exact flow.
6. Collect app-pid and crash-buffer logcat evidence.
7. Patch and replay the same flow.

### Preview An Android App In Codex

Example prompt:

```text
Launch the debug app on an emulator and show it in the Codex side-panel browser
while I review the Compose screen.
```

Expected workflow:

1. Load `android-debugger-agent` and `android-emulator-browser`.
2. Select or boot one adb target and install the requested variant.
3. Launch the target package or activity.
4. Start `android-emulator-browser.mjs --serial <adb-serial>` in a long-running
   terminal.
5. Open the printed localhost URL in the visible Codex side-panel browser.
6. Verify a real Android frame is rendering, then use browser-visible proof for
   the closeout.

### Add An External Action

Example prompt:

```text
Add a verified App Link for product details and a launcher shortcut for recent
orders. Route both through the existing navigation model.
```

Expected workflow:

1. Load `android-app-actions`.
2. Choose the smallest external surfaces that satisfy the use case.
3. Centralize URI parsing and parameter validation.
4. Reuse the same typed destination model as in-app navigation.
5. Verify cold-start, warm-start, invalid-input, and back-stack behavior.

### Profile Jank

Example prompt:

```text
The Compose feed drops frames while scrolling. Find the root cause and prove
the improvement.
```

Expected workflow:

1. Load `compose-performance-audit`.
2. Inspect state reads, lazy keys, composition-time work, layout, draw, and
   image paths.
3. Apply a narrow code fix when the cause is clear.
4. Load `android-runtime-performance` when runtime evidence is required.
5. Capture comparable Macrobenchmark and Perfetto evidence on the same target.

### Investigate A Retained Screen

Example prompt:

```text
Memory grows after repeatedly entering and leaving the camera screen. Find the
retaining path and verify the fix.
```

Expected workflow:

1. Load `android-memory-leaks` and `android-debugger-agent`.
2. Build and launch the exact variant.
3. Reproduce the same flow and return to a stable idle point.
4. Capture `meminfo` and an HPROF heap dump.
5. Inspect retained app-owned objects and GC-root chains.
6. Patch the smallest retaining edge.
7. Repeat the same capture and compare the same retained types.

## Helper Scripts

The plugin includes small helpers for repeatable diagnostics. They use standard
Python, shell, Android SDK, and profiling tools. They do not replace direct UI,
heap, or trace inspection.

### Summarize A UI Tree

```bash
python3 skills/android-debugger-agent/scripts/ui_tree_summarize.py \
  /tmp/android-ui.xml \
  /tmp/android-ui-summary.txt
```

Reads a UI Automator XML dump and writes a compact text summary for inspection.

### Pick A UI Element

```bash
python3 skills/android-debugger-agent/scripts/ui_pick.py \
  /tmp/android-ui.xml \
  "Settings"
```

Searches the UI Automator XML tree for text and prints coordinates suitable for
an adb tap command. Re-dump the tree after navigation or layout changes.

### Capture Android Memory Evidence

```bash
skills/android-memory-leaks/scripts/capture_android_memory.sh \
  --serial <adb-serial> \
  --package <application-id> \
  --out-dir /tmp/android-memory \
  --label after-flow
```

Captures `dumpsys meminfo` output and pulls an Android-format HPROF heap dump
from a running app.

### Mirror An Android Emulator In The Browser

```bash
node skills/android-emulator-browser/scripts/android-emulator-browser.mjs \
  --serial <adb-serial>
```

Serves a local browser UI that refreshes adb screenshots and forwards basic
tap, swipe, text, and key input through adb. Open the printed URL in the visible
Codex side-panel browser.

For a clean emulator validation run, use an explicit adb target and keep the
bridge in its own long-running terminal:

```bash
emulator -avd <avd-name> -no-window -no-audio -no-boot-anim -no-snapshot
adb -s <adb-serial> wait-for-device
adb -s <adb-serial> shell getprop sys.boot_completed
node skills/android-emulator-browser/scripts/android-emulator-browser.mjs \
  --serial <adb-serial>
```

The browser page should show a real Android frame, not just a loaded localhost
shell. Validate at least one input path, such as tapping a launcher icon or
pressing the page's Home button and confirming the focused Android activity
with `dumpsys window`.

### Summarize Simpleperf Hotspots

```bash
skills/android-runtime-performance/scripts/simpleperf_hotspots.sh \
  /path/to/perf.data \
  /tmp/android-perf \
  --serial <adb-serial> \
  --first-party-regex 'com\.example\.app'
```

Generates Simpleperf self-time, inclusive, and optional CSV reports for a
focused capture.

### Generate Heapprofd Reports

```bash
skills/android-runtime-performance/scripts/heapprofd_reports.sh \
  /path/to/native-alloc.pftrace \
  /tmp/android-native-alloc
```

Generates text reports from a Perfetto trace captured with the `heapprofd` data
source enabled.

## Requirements

Install Android Studio or the Android SDK command-line tools required by the
project.

Baseline checks:

```bash
java -version
adb version
adb devices -l
emulator -list-avds
./gradlew help
```

Typical requirements:

| Concern | Typical tools |
| --- | --- |
| Build | Project Gradle wrapper, compatible JDK, Android SDK platforms, and Build Tools |
| Device debugging | SDK platform-tools, adb, a booted emulator or connected device |
| Browser preview | Node.js, adb, a booted emulator or connected device that supports `screencap` and `input` |
| UI inspection | UI Automator dump support, screenshots, Compose semantics, and optional instrumented UI tests |
| Performance | Macrobenchmark module, profileable app variant, Perfetto, Simpleperf, and a physical device for representative metrics |
| Memory | `dumpsys meminfo`, heap-dump support, Android Studio Profiler, optional Shark or LeakCanary, and Perfetto `heapprofd` for native allocations |
| External actions | App manifest, `shortcuts.xml` where required, owned web-domain configuration for verified App Links, and current Assistant support checks |

The plugin does not assume that all tools are globally available. It first
checks the repository wrapper, SDK paths such as `$ANDROID_SDK_ROOT`, and the
active adb target.

## Install From This Repository

Clone the plugin into a local Codex plugin source directory:

```bash
mkdir -p ~/plugins
git clone https://github.com/SangkuOh/build-androidos-apps.git \
  ~/plugins/build-androidos-apps
```

Expose the source through your personal Codex marketplace at
`~/.agents/plugins/marketplace.json`. If the file already exists, merge the
following entry into its `plugins` array instead of replacing unrelated
entries:

```json
{
  "name": "build-androidos-apps",
  "source": {
    "source": "local",
    "path": "./plugins/build-androidos-apps"
  },
  "policy": {
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL"
  },
  "category": "Developer Tools"
}
```

Install the plugin from the configured personal marketplace:

```bash
codex plugin add build-androidos-apps@personal
codex plugin list
```

To update an existing local install:

```bash
git -C ~/plugins/build-androidos-apps pull --ff-only
codex plugin remove build-androidos-apps@personal
codex plugin add build-androidos-apps@personal
```

Start a new Codex thread after installation so the new plugin skills are
available to the conversation.

## Repository Layout

```text
.
|-- .codex-plugin/
|   `-- plugin.json
|-- agents/
|   `-- openai.yaml
|-- assets/
|   |-- app-icon.png
|   `-- build-androidos-apps-small.svg
|-- skills/
|   |-- android-project-setup/
|   |-- android-debugger-agent/
|   |-- android-emulator-browser/
|   |-- android-app-actions/
|   |-- material3-adaptive-ui/
|   |-- compose-ui-patterns/
|   |-- compose-view-refactor/
|   |-- compose-performance-audit/
|   |-- android-runtime-performance/
|   `-- android-memory-leaks/
|-- LICENSE
`-- README.md
```

Each skill contains a `SKILL.md`. Larger workflows load focused material from
their own `references/` directory. Diagnostic helpers live under the relevant
skill's `scripts/` directory.

## Verification Principles

The plugin is intentionally conservative about claiming success.

- Build failures are fixed before UI interaction.
- Device workflows use an explicit adb serial.
- Browser previews prove that a real Android frame is rendering, not only that
  a localhost page loaded.
- Browser-preview input forwarding is verified by pairing the browser action
  with Android focus or UI-tree evidence.
- UI trees are refreshed after navigation or layout changes.
- User-visible flows are replayed after a patch.
- Compose performance review starts with code and state flow.
- Representative performance numbers come from comparable runs on a physical
  device.
- Emulator metrics are treated as directional evidence.
- Macrobenchmark captures record variant, compilation mode, target, and run
  count.
- CPU samples are not treated as wall-clock latency evidence.
- Memory conclusions distinguish heap retention from native allocation growth.
- A smaller process snapshot alone is not treated as proof of a leak fix.
- External URI parameters are validated before routing.
- App Actions are verified at runtime instead of only compiling XML.

## Official Android References

Use current official Android documentation for version-sensitive decisions:

- [Android Gradle Plugin release notes](https://developer.android.com/build/releases/gradle-plugin)
- [Migrate to built-in Kotlin](https://developer.android.com/build/migrate-to-built-in-kotlin)
- [Compose BOM](https://developer.android.com/develop/ui/compose/bom)
- [Compose state hoisting](https://developer.android.com/develop/ui/compose/state-hoisting)
- [Build adaptive apps](https://developer.android.com/develop/ui/compose/building-adaptive-apps)
- [Window insets](https://developer.android.com/develop/ui/compose/layouts/insets)
- [Android Debug Bridge](https://developer.android.com/studio/command-line/adb)
- [UI Automator](https://developer.android.com/training/testing/other-components/ui-automator)
- [App shortcuts](https://developer.android.com/develop/ui/views/launch/shortcuts)
- [Android App Links](https://developer.android.com/training/app-links)
- [App Actions overview](https://developer.android.com/guide/app-actions/overview)
- [Macrobenchmark overview](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview)
- [Baseline Profiles](https://developer.android.com/topic/performance/baselineprofiles/overview)
- [Perfetto system tracing](https://developer.android.com/topic/performance/tracing)
- [Memory Profiler](https://developer.android.com/studio/profile/memory-profiler)

## License

MIT. See [LICENSE](LICENSE).
