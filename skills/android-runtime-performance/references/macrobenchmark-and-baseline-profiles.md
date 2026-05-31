# Macrobenchmark And Baseline Profiles

## When To Use

- Measure startup, scrolling, animation, or complex UI flows.
- Compare a runtime optimization before and after.
- Generate Baseline Profiles for important user journeys.

## Setup Rules

- Put Macrobenchmark tests in a separate module using `com.android.test`.
- Benchmark a target app variant configured as `profileable`.
- Prefer a physical device for representative numbers.
- Use Android 14 API 34+ when benchmark state persistence behavior matters.
- Record compilation mode, startup mode, device, OS, variant, and iteration count.
- Preserve benchmark JSON and trace output for the exact run.

Typical command:

```bash
./gradlew :macrobenchmark:connectedCheck
```

Run a focused test:

```bash
./gradlew :macrobenchmark:connectedCheck \
  -P android.testInstrumentationRunnerArguments.class=<package>.StartupBenchmark#startup
```

## Startup

- Choose `COLD`, `WARM`, or `HOT` deliberately.
- Keep setup outside measured work.
- Compare the same startup mode and compilation mode across runs.

## Baseline Profiles

- Cover startup and the small number of critical interactions users feel immediately.
- Generate and ship profiles through the supported Baseline Profile tooling.
- Verify the profile is packaged and compare profile-enabled behavior against a controlled baseline.
- Avoid treating a generated profile as proof until the target build consumes it.

## Official Docs

- Macrobenchmark: `https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview`
- Baseline Profiles: `https://developer.android.com/topic/performance/baselineprofiles/overview`
- Performance overview: `https://developer.android.com/topic/performance`

At verification time, official guidance states that Macrobenchmark is intended for larger
app-level flows and that emulator timing is not representative of end-user performance.
