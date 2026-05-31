# Android External Action Surfaces

Choose the narrowest surface that satisfies the user workflow.

| Surface | Best fit | Main artifact |
| --- | --- | --- |
| Deep link | Open a destination from a URI | Manifest intent filter and centralized URI router |
| Verified App Link | Open owned HTTPS URLs directly in the app | HTTPS intent filter, `autoVerify`, hosted association file |
| Static shortcut | Stable launcher action | `res/xml/shortcuts.xml` |
| Dynamic shortcut | Personalized or recent action | Shortcut publishing code |
| Pinned shortcut | User-requested launcher shortcut | Shortcut pin request |
| App Action | Assistant voice fulfillment | `shortcuts.xml` capability mapped to an Android intent |

## Decision Rules

- Reuse one routing model across app links, shortcuts, notifications, widgets, and in-app navigation.
- Use launcher shortcuts for frequent actions, not for every destination.
- Use App Actions only when Assistant access adds value and the BII or custom intent maps clearly.
- Keep dynamic shortcuts current when underlying content changes or becomes unavailable.

## Official Docs

- Shortcuts overview: `https://developer.android.com/develop/ui/views/launch/shortcuts`
- App Actions overview: `https://developer.android.com/guide/app-actions/overview`
- `shortcuts.xml` schema: `https://developer.android.com/develop/devices/assistant/action-schema`
- App Links: `https://developer.android.com/training/app-links`

Re-check current support before committing to Assistant behavior.
