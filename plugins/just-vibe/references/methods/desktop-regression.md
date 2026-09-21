# Desktop and cross-host regression testing

Use when: windows desktop, ui automation, cross-agent regression, benchmark harness.

Create an isolated, reproducible host/desktop test with explicit UI and execution authority.

## Inspect first

- OS build, accessibility API and host/tool versions
- Dedicated test account/window and synthetic data
- Stable locators, fixture reset and failure artifacts

## Method

1. Use accessibility identifiers or documented APIs before coordinates. Record current foreground window before sending input and abort on a target mismatch.
2. Keep test fixtures outside the user’s active documents. Reset only owned fixture state and preserve crash artifacts.
3. For cross-agent trials, hold brief, repository commit, tool capabilities and acceptance cases fixed. Separate install/protocol tests from actual model behavior.
4. Evaluate task completion and user-visible correctness with a review rubric; keep token usage and elapsed time as descriptive metrics only.

## Failure cases

- Focus moves to another application before a destructive keystroke.
- A passing screenshot hides an offscreen error or inaccessible control.
- Different host permissions make the comparison confounded.

## Verification

- Run a known-failing negative control.
- Capture UI tree, app/version and exact fixture identity.
- Mark untested OS/hosts explicitly; do not convert skips into passes.

## Worked scenario

A Windows save dialog test first verifies its owning application and filename field, then writes only to the fixture directory.

## Version-sensitive primary references

- [learn.microsoft.com](https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32) — Read the official source for the installed version before relying on a version-sensitive API.
- [playwright.dev](https://playwright.dev/docs/test-assertions) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
