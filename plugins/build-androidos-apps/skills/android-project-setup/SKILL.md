---
name: android-project-setup
description: Set up or modernize Android projects with Kotlin, Jetpack Compose, Material 3, Gradle Kotlin DSL, version catalogs, and current Android Gradle Plugin conventions. Use when creating a new Android app, migrating Gradle files, adopting AGP 9 built-in Kotlin, configuring Compose dependencies, selecting SDK levels, or repairing build-tool compatibility.
---

# Android Project Setup

## Overview

Configure Android projects conservatively: inspect the existing build first, preserve repo conventions, and change only the layers required by the request. Use official Android and Kotlin documentation to re-check version-sensitive guidance before editing.

Read `references/modern-build-baseline.md` before creating a project or changing AGP, Kotlin, Compose, Gradle, JDK, compile SDK, target SDK, or KSP configuration.

## Workflow

1. Inspect `settings.gradle.kts`, root and module `build.gradle.kts` files, `gradle/libs.versions.toml`, `gradle-wrapper.properties`, `gradle.properties`, and module layout.
2. Identify whether the request is a fresh setup, a narrow dependency addition, or a toolchain migration.
3. Preserve existing architecture and dependency-management style unless the task explicitly asks for modernization.
4. For fresh Android app modules, prefer Kotlin DSL, version catalogs, Compose, Material 3, and the Gradle wrapper.
5. For AGP 9+ projects, account for built-in Kotlin before applying or retaining `org.jetbrains.kotlin.android`.
6. For Compose modules, configure the Compose Compiler Gradle plugin that matches the Kotlin version and use the stable Compose BOM unless a preview dependency is explicitly needed.
7. Run the smallest meaningful Gradle verification, then broaden it when shared build logic changed.

## Strong Defaults

- Use the checked-in Gradle wrapper through `./gradlew`.
- Keep versions centralized in `gradle/libs.versions.toml` when the repo already uses a catalog.
- Prefer stable dependencies for production code. Add alpha or beta artifacts only when a requested API requires them.
- Prefer KSP over kapt for annotation processing when the dependency supports it.
- Keep `minSdk` driven by product support requirements. Do not raise it just to simplify implementation without surfacing the tradeoff.
- Choose `compileSdk` and `targetSdk` deliberately. Re-check platform behavior changes when raising `targetSdk`.
- Use `namespace` in module Gradle configuration and keep package moves separate from toolchain upgrades.

## Verification

Start narrow:

```bash
./gradlew help
./gradlew :app:assembleDebug
```

Then run the relevant project gates:

```bash
./gradlew :app:testDebugUnitTest
./gradlew :app:lintDebug
./gradlew :app:connectedDebugAndroidTest
```

If task names differ, discover them with:

```bash
./gradlew tasks --all
```

## Guardrails

- Do not paste a generic Gradle template over an existing build.
- Do not use dynamic dependency versions such as `9.2.+`.
- Do not apply `org.jetbrains.kotlin.android` blindly in AGP 9+ modules; check built-in Kotlin migration requirements.
- Do not combine a toolchain upgrade with unrelated architecture churn.
- Do not claim a version is current without checking official docs during the active task.
