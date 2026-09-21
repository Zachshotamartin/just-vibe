# React Native and Expo

Use for a confirmed React Native/Expo project. Establish React Native, React, Expo SDK, native architecture, Hermes, navigation and library versions. Identify managed versus prebuild/bare ownership before editing ios/android output. Match native modules and build instructions to the actual supported platforms.

## Implementation decisions

Trace the interaction across component state, navigation, service calls and native modules. Keep effects tied to the identity they synchronize; unsubscribe listeners and guard stale responses. Account for screen blur versus actual unmount: navigation can retain a screen. Define background/foreground and auth-session-expiry behavior explicitly.

Use FlatList/SectionList with stable identity, bounded rendering and measured layout choices for long lists. Avoid assuming web CSS or DOM semantics exist. Check safe areas, keyboard avoidance, status/navigation bars, text scaling, orientation and low-width devices. Do not hardcode container heights that clip translated text or validation messages.

Use accessibilityRole/Label/State and appropriate focus behavior for the installed API. Test modal entry/exit, disabled/loading controls, screen reader order and reduced motion. Icons come from the existing vector/icon system; no emojis unless requested. Animations must clean up and avoid blocking the JavaScript thread; verify the chosen animation API's native/platform limits.

Do not store credentials in ordinary unencrypted key-value storage or embed backend secrets in public bundles. Validate deep-link parameters and authorization before navigating to private content. Handle denied permissions, absent hardware and unsupported platform APIs. Queue offline mutations only with an explicit replay/idempotency policy; distinguish local optimistic state from confirmed server state.

## Tests and builds

- Component tests verify visible states and user interactions rather than component internals. Test request races, navigation away during work, and expired auth. Mocking a native module establishes only the JavaScript contract.
- Native end-to-end tests on emulator/device cover permissions, deep links, push behavior and native module integration. Verify both platforms for shared code that relies on platform behavior.
- For Expo, inspect the matching SDK's compatibility tools and build profile before dependency changes. Development-client and production builds can differ from Expo Go; identify which one was tested.
- For bare/prebuild changes, use the existing Gradle/Xcode/CocoaPods workflow and locked dependencies. Review generated native changes; do not erase intentional native edits by rerunning prebuild blindly.
- Reproduce performance issues in a representative release build. Separate JavaScript work, native rendering, network delay and image memory before selecting an optimization.

## Delivery

Record exact platforms/build variants exercised, actual checks and any device-only gaps. OTA updates cannot introduce arbitrary incompatible native code; verify runtime/version compatibility through the project's release system. Publishing binaries or updates requires the user's deployment scope, not merely a completed local fix.

References: [testing](https://reactnative.dev/docs/testing-overview), [security](https://reactnative.dev/docs/security), [performance](https://reactnative.dev/docs/performance), [accessibility](https://reactnative.dev/docs/accessibility), [Expo workflow](https://docs.expo.dev/workflow/overview/).
