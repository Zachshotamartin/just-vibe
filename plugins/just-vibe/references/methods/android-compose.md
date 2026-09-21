# Android and Compose Multiplatform lifecycle

Use when: android compose, compose multiplatform, android architecture.

Build or review lifecycle-aware UI and platform boundaries on declared Kotlin/Android targets.

## Inspect first

- State holder ownership, navigation and lifecycle
- Coroutine collection, saved state and process death
- Shared versus platform-specific dependencies

## Method

1. Keep domain behavior testable without an Activity; represent loading/error/empty/success states explicitly.
2. Collect streams with the appropriate lifecycle and scope. Cancel obsolete work when navigation or selected identity changes.
3. Use stable item keys and side-effect APIs with complete dependencies. Treat recomposition as repeatable rendering, not a one-time callback.
4. In multiplatform code, define platform adapters for storage, permissions and networking; verify each supported target separately.

## Failure cases

- A collector survives navigation and duplicates requests.
- State disappears on process recreation despite surviving recomposition.
- A shared abstraction hides different permission or file-access semantics.

## Verification

- Test navigation away/back, rotation and process-state restoration.
- Use semantics-based UI assertions, keyboard/accessibility checks and device-size cases.
- Label emulator/device-only checks separately.

## Worked scenario

Rapid account switching must cancel stale loads and show the selected account after recreation.

## Version-sensitive primary references

- [developer.android.com](https://developer.android.com/develop/ui/compose/lifecycle) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.jetbrains.com](https://www.jetbrains.com/help/kotlin-multiplatform-dev/compose-multiplatform.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
