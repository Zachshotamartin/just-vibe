# Flutter applications

Use for a project with Flutter in pubspec.yaml. Inspect the locked SDK/dependencies, platform targets, navigation, state management, native plugins and flavor configuration. Reuse the existing architecture and design system. A Dart-only test cannot prove a native plugin works on a device.

## Implement the complete interaction

Model loading, success, empty, validation, offline and retry states before wiring asynchronous work. Tie subscriptions, controllers, focus nodes, animation controllers and timers to their owner and dispose them. After an await, verify the widget/context remains mounted before updating UI or navigating. Prevent an older request from overwriting results for a newer identity/query; cancellation and an identity guard serve different purposes.

Keep expensive work outside build. Derive display values where possible and isolate rebuilds based on observed performance, rather than adding state-management layers or const indiscriminately. Use stable keys where widget identity matters. For lists, verify lazy construction, scroll restoration and changed item identity.

Respect SafeArea, keyboard/view insets, text scaling, locale direction, constrained widths and platform navigation. Verify validation messages and long text without fixed-height clipping. Provide semantic labels, logical focus order and sufficient targets. Use vector assets or the project's icon package; no emojis unless the user requests them. Honor reduced motion and screen reader settings.

For storage/authentication, use the existing platform-supported secure-storage approach. Do not put service secrets in the app bundle. Treat deep links, platform-channel inputs and restored state as untrusted. Request permissions at the relevant user action and handle denied/restricted states. Ensure retrying an upload/payment/action cannot duplicate the server-side effect.

## Tests that reveal real failures

- Unit-test state transitions and service logic with a controllable clock/network. Test slow first response followed by fast second response and disposal during the request.
- Widget-test loading/error/empty/content states, keyboard focus, text scaling and narrow layouts. Pump bounded frames for animations; pumpAndSettle can hang on an intentional repeating animation.
- Use golden tests only with a controlled rendering environment and review changed images; a blanket baseline update is not verification.
- Run integration_test on the appropriate emulator/device for plugin permissions, deep links, persistence and lifecycle transitions. Simulate background/foreground, process restart where feasible, and interrupted network operations.
- Apply Flutter's accessibility guideline tests and manually check the affected interaction with TalkBack or VoiceOver when those tools are available.

## Verification and delivery

Run the repository's flutter analyze, targeted flutter test and appropriate integration command using its SDK/flavor. Profile a release/profile build on representative hardware for frame or startup problems; debug-build timing is not production evidence. State target OS, device/emulator, flavor and native behaviors tested. Do not claim App Store/Play Store readiness from a successful local build.

References: [testing overview](https://docs.flutter.dev/testing/overview), [integration tests](https://docs.flutter.dev/testing/integration-tests), [accessibility testing](https://docs.flutter.dev/ui/accessibility/accessibility-testing), [performance](https://docs.flutter.dev/perf).
