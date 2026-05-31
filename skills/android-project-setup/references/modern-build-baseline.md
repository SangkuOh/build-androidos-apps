# Modern Android Build Baseline

Use this as a checked snapshot, not as an excuse to skip current official documentation.
The values below were verified against official sources on 2026-06-01.

## Verified Snapshot

| Layer | Verified stable baseline | Notes |
| --- | --- | --- |
| Android Gradle Plugin | `9.2.0` | Supports API level `36.1`; requires Gradle `9.4.1`, Build Tools `36.0.0`, and JDK `17`. |
| Gradle wrapper | `9.4.1` | Match the AGP compatibility table. |
| JDK | `17` | Match AGP requirements unless the active repo documents a supported override. |
| Kotlin | `2.3.21` | Latest stable Kotlin bug-fix release in the official Kotlin release history at verification time. |
| Compose BOM | `2026.05.00` | Stable BOM. Use BOM-managed Compose library versions. |

Re-check before creating a fresh project or upgrading toolchains:

- AGP release notes: `https://developer.android.com/build/releases/gradle-plugin`
- AGP built-in Kotlin migration: `https://developer.android.com/build/migrate-to-built-in-kotlin`
- Compose dependency and compiler setup: `https://developer.android.com/develop/ui/compose/setup-compose-dependencies-and-compiler`
- Compose BOM: `https://developer.android.com/develop/ui/compose/bom`
- Kotlin releases: `https://kotlinlang.org/docs/releases.html`
- Play target API requirements: `https://developer.android.com/google/play/requirements/target-sdk`

## AGP 9 Built-In Kotlin

AGP 9+ enables built-in Kotlin by default for modules that apply AGP.

- Remove `org.jetbrains.kotlin.android` from AGP-backed modules when migrating to built-in Kotlin.
- Migrate `android.kotlinOptions {}` to `kotlin.compilerOptions {}`.
- Prefer KSP over kapt. If kapt cannot move yet, consult current AGP guidance for the legacy kapt bridge.
- Do not mix `org.jetbrains.kotlin.multiplatform` with `com.android.application` or `com.android.library` in the same module when built-in Kotlin is enabled. Use the supported KMP Android library plugin where appropriate.
- Apply the Compose Compiler Gradle plugin to Compose modules and match its version to Kotlin.

For existing projects, migrate separately from unrelated feature work. Opting out of built-in
Kotlin is a temporary compatibility path, not the fresh-project default.

## SDK Selection

- Use the latest stable `compileSdk` supported by the chosen AGP unless the repo has a compatibility constraint.
- Choose `targetSdk` after checking behavior changes and current Play submission requirements.
- Keep `minSdk` tied to product support requirements.
- Test edge-to-edge behavior when targeting SDK 35+ because Android 15+ enforces it.

## Dependency Management

- Prefer `gradle/libs.versions.toml` for shared versions and plugin aliases.
- Use the stable Compose BOM for Compose libraries.
- Do not put versions on BOM-managed Compose dependencies.
- Avoid dynamic versions and broad dependency upgrades during feature-only tasks.

## Verification Matrix

After changing shared build logic:

```bash
./gradlew help
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest
./gradlew :app:lintDebug
```

Add instrumentation or benchmark tasks when those modules were touched.
