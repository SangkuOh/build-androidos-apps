# External Action Implementation Checklist

## Deep Links And App Links

- Define a typed destination or domain command.
- Parse URI parameters in one router.
- Validate required parameters and reject malformed values.
- Confirm cold-start and warm-start behavior.
- Confirm back-stack behavior after inbound navigation.
- Add App Link verification only for domains the app controls.

## Shortcuts

- Keep stable ids.
- Use short labels that scan well on the launcher.
- Remove or disable shortcuts when their content is unavailable.
- Publish only a small useful set.
- Route through the same destination model as the in-app UI.

## App Actions

- Identify the supported Assistant built-in intent before writing XML.
- Add the `shortcuts.xml` resource and manifest metadata.
- Choose exactly one fulfillment path per intent entry: explicit target, deep-link URL template, or intent data.
- Validate required parameters.
- Test the invoked app route rather than only checking XML compilation.

Official schema: `https://developer.android.com/develop/devices/assistant/action-schema`
