# SwiftUI, actors and Swift concurrency

Use when: swiftui, swift 6, actor persistence, foundation models, liquid glass.

Implement an Apple-platform feature with exact deployment targets and concurrency mode established.

## Inspect first

- Xcode/Swift language mode and deployment targets
- Actor isolation, Sendable boundaries and UI ownership
- Persistence schema, offline behavior and model availability

## Method

1. Keep UI-observed mutation on its intended actor. Recheck assumptions after await because actor reentrancy permits intervening state changes.
2. Use protocol-based dependencies for storage/network/model sessions; inject deterministic fakes with cancellation behavior.
3. Persist through an actor-owned repository with atomic writes and explicit migration. Do not treat actor isolation as cross-process file locking.
4. For Foundation Models or Liquid Glass, verify API availability for the actual OS/toolchain, add accessible fallbacks and test on supported hardware; never assume simulated model availability.

## Failure cases

- An actor validates state, awaits a network call and commits using stale assumptions.
- A detached task mutates UI state.
- A new visual material reduces contrast or hides hit targets.

## Verification

- Compile under the project’s strict concurrency settings.
- Test cancellation, interrupted persistence and migration failures.
- Inspect VoiceOver, contrast, reduced motion and unsupported-device fallback.

## Worked scenario

After awaiting an account refresh, confirm the account ID is still selected before publishing the result.

## Version-sensitive primary references

- [docs.swift.org](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) — Read the official source for the installed version before relying on a version-sensitive API.
- [developer.apple.com](https://developer.apple.com/documentation/foundationmodels) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
