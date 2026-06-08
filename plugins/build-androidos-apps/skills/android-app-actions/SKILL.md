---
name: android-app-actions
description: Design and implement Android shortcuts, deep links, App Links, and Google Assistant App Actions with shortcuts.xml capabilities. Use when exposing app actions or content outside the main UI, adding static or dynamic shortcuts, routing external intents, mapping Assistant built-in intents, or validating shortcut fulfillment.
---

# Android App Actions

## Overview

Expose a small, useful external action surface. Start from verbs and destinations users need outside the app, then wire shortcuts, deep links, or Assistant capabilities into one predictable routing path.

Read:

- `references/system-surfaces.md` to choose the right Android surface.
- `references/implementation-checklist.md` before editing manifests, `shortcuts.xml`, or shortcut publishing code.

## Core Workflow

### 1. Choose the user-facing action

- Identify the 1-3 highest-value verbs: open, search, compose, continue, create, record, or inspect.
- Avoid mirroring the full navigation tree.
- Decide whether the action opens a screen, performs a small direct operation, or opens a parameterized destination.

### 2. Choose the surface

- Use deep links or verified App Links for inbound URLs.
- Use static shortcuts for stable launcher actions.
- Use dynamic shortcuts for personalized or recent content.
- Use App Actions only when a supported Assistant built-in intent or justified custom intent maps cleanly to the feature.

### 3. Implement one routing path

- Keep URI parsing and intent handling centralized.
- Route from external inputs to typed app destinations or domain commands.
- Validate and sanitize incoming parameters.
- Keep business logic outside activities, receivers, and shortcut publishing code.

### 4. Add App Actions when needed

- Define capabilities in `res/xml/shortcuts.xml`.
- Map the capability to an explicit activity or a deep-link fulfillment.
- Keep entity inventory small and user-relevant.
- Confirm manifest metadata points at the shortcuts resource.

### 5. Validate

Exercise deep links directly:

```bash
adb -s <serial> shell am start -W \
  -a android.intent.action.VIEW \
  -d "https://example.com/path?item=123" \
  <package>
```

Then verify the expected destination, back-stack behavior, invalid-input handling, and cold-start routing. For shortcuts and Assistant flows, confirm the published shortcut or capability invokes the same route.

## Strong Defaults

- Prefer explicit intents for Assistant fulfillment when a dedicated destination exists.
- Reuse the same domain action for shortcut, widget, notification, and in-app entry points.
- Keep dynamic shortcut ranks and lifecycle updates deterministic.
- Make deep-link destinations idempotent and safe to invoke from a cold start.

## Anti-Patterns

- Exposing every screen as a shortcut.
- Adding separate ad hoc routers for launcher shortcuts, Assistant, and App Links.
- Trusting external URI parameters without validation.
- Treating App Actions built-in intents as Android framework intents; they are separate semantic mappings.
- Claiming an Assistant capability works after only compiling it.

Use current official Android documentation when App Actions support, schema details, or Play requirements may have changed.
