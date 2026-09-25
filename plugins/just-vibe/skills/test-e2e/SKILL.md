---
name: test-e2e
description: "Exercise complete user journeys and recovery Use for a critical user journey across the actual interface; test-unit is preferable for pure logic branches."
---

# test-e2e

Exercise complete user journeys and recovery

## Choose this workflow

Use for a critical user journey across the actual interface; test-unit is preferable for pure logic branches.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; critical journey, environment, test accounts, and external side-effect constraints.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Requested bounded verification may use owned isolated fixtures without authorizing product edits or live-system tests. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

- **Infer from evidence:** Read behavior contracts, existing runners and test conventions; distinguish fixture setup failure from a behavioral failure.
- **Reasonable default:** Use the smallest existing local runner and isolated synthetic fixtures that distinguish the requested behavior. When the method needs a library, runner, container runtime or load tool the project lacks, name the exact package or tool, the files it changes and any download, and add it only when the request authorizes new dev dependencies or tools; label a hand-written generator without shrinking, or a fake in place of a real dependency, as such.
- **Ask only when needed:** Ask about an unresolved contract that changes the expected result, or the target/load limits before external testing; do not ask the user to choose a runner already configured.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Full user-visible flows including recovery, through real application boundaries available in the test environment.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Seed controlled data, use robust user-facing selectors, exercise the journey and failure recovery, assert observable outcomes, and clean up owned data.
2. Define stable setup and cleanup, drive user-visible controls with semantic locators and assert the final meaningful outcome plus a recovery path.
## Technical method

- **Inspect:** Define the critical user journey, identities, stable state and permitted side effects.
- **Method:** Use semantic locators and user-visible outcomes; isolate accounts and preserve artifacts when the journey fails.
- **Avoid misdiagnosis:** A screenshot or HTTP 200 alone does not prove a completed transaction or accessible interaction.
- **Check the result:** Run the main path and meaningful recovery path, including direct navigation and persisted result where applicable.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Testing worked example](../../references/examples/testing.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves windows desktop, ui automation, cross-agent regression, benchmark harness; load only the matching method: [Desktop and cross-host regression testing](../../references/methods/desktop-regression.md).

## Decision branches

- **When a third-party payment or email effect is real:** Use an authorized sandbox or controlled boundary; do not send real effects merely to complete a test.

## Deliver and verify

- End-to-end tests, traces on failure, and environment/coverage notes.
- Journey steps, environment, assertions, artifacts and untested external boundaries.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A completed UI action has the intended persisted outcome; failed submission preserves recoverable user state.

## Stop and recover

- Do not send real payments/emails or modify user accounts without explicit scope. Missing integrations are labeled honestly.

## Example requests

- **Normal (apply):** Test checkout error recovery using controlled test accounts and no real charges.
- **edge (apply):** Test checkout failure and retry without duplicate orders.
- **blocked (inspect):** Plan browser tests when no browser tool is available; do not claim rendered success.
