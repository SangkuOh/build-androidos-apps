# Compose Performance Report Template

## Scope

- Flow:
- Target:
- Android version:
- Variant:
- Run count:

## Findings

| Priority | Evidence | Impact | Fix |
| --- | --- | --- | --- |
| P1 | Code reference or trace metric | User-visible cost | Narrow remediation |

## Metrics

| Metric | Before | After | Source |
| --- | --- | --- | --- |
| Startup or frame metric |  |  | Macrobenchmark, Perfetto, or gfxinfo |

## Caveats

- Separate code-backed suspicion from trace-backed evidence.
- State whether emulator noise, thermal state, compilation mode, or low run count limits confidence.

## Verification

- List the exact command and focused flow used after the fix.
