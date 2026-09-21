# HarmonyOS and ArkTS state/lifecycle

Use when: harmonyos, arkts, arkui.

Implement a bounded ArkUI feature using the project’s SDK and supported device capabilities.

## Inspect first

- SDK/API level, stage model and module declarations
- Component state decorators, navigation and lifecycle
- Permissions, asynchronous tasks and local persistence

## Method

1. Read the installed SDK documentation for the state-management version before applying decorators or migration patterns.
2. Separate rendering from side effects and release subscriptions/resources when their owner disappears.
3. Validate permissions and device capabilities before calling platform services; handle refusal and revocation as normal states.
4. Keep transport and persistence behind typed adapters so synthetic fixtures can exercise failures without live device data.

## Failure cases

- A component keeps updating after its page is destroyed.
- A state object changes in a way the selected decorator does not observe.
- A permission-dependent call works on an emulator but fails on a real device.

## Verification

- Build with the declared SDK and lint rules.
- Test navigation, permission denial and offline restart.
- Record which checks require a HarmonyOS device.

## Worked scenario

Leaving a page during a network request must prevent late callbacks from mutating a destroyed component.

## Version-sensitive primary references

- [developer.huawei.com](https://developer.huawei.com/consumer/en/doc/) — Read the official source for the installed version before relying on a version-sensitive API.
- [developer.huawei.com](https://developer.huawei.com/consumer/en/arkts/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
