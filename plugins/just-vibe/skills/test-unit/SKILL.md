---
name: test-unit
description: "Test isolated behaviors and boundaries Use for isolated domain/component behavior; test-integration checks real dependency boundaries."
---

# test-unit

Test isolated behaviors and boundaries

## Choose this workflow

Use for isolated domain/component behavior; test-integration checks real dependency boundaries.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; unit/behavior, edge cases, and existing test framework.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Requested bounded verification may use owned isolated fixtures without authorizing product edits or live-system tests. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

- **Infer from evidence:** Read behavior contracts, existing runners and test conventions; distinguish fixture setup failure from a behavioral failure.
- **Reasonable default:** Use the smallest existing local runner and isolated synthetic fixtures that distinguish the requested behavior. When the method needs a library, runner, container runtime or load tool the project lacks, name the exact package or tool, the files it changes and any download, and add it only when the request authorizes new dev dependencies or tools; label a hand-written generator without shrinking, or a fake in place of a real dependency, as such.
- **Ask only when needed:** Ask about an unresolved contract that changes the expected result, or the target/load limits before external testing; do not ask the user to choose a runner already configured.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Isolated contracts and invariants with minimal justified mocks.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Identify observable inputs/outputs, choose meaningful boundaries, create focused tests, check error cases, and run the relevant suite.
2. Select a public behavior and independent expected result, use minimal valid fixtures and cover a meaningful invalid or boundary input without asserting private implementation steps.
## Technical method

- **Inspect:** Identify the public behavior, pure boundary, dependencies and independently derivable expectations.
- **Method:** Choose small examples around equivalence classes and exact boundaries; control clock/randomness rather than sleeping.
- **Avoid misdiagnosis:** Asserting internal helper calls or computing expected results with the implementation repeats its mistakes.
- **Check the result:** Demonstrate that a plausible wrong result fails an assertion while valid empty/zero/boundary cases pass.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Testing worked example](../../references/examples/testing.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves windows desktop, ui automation, cross-agent regression, benchmark harness; load only the matching method: [Desktop and cross-host regression testing](../../references/methods/desktop-regression.md).

## Decision branches

- **When heavy mocking hides the behavior under test:** Move the test to the appropriate integration layer or replace only the true external boundary.

## Deliver and verify

- Unit tests, fixture rationale, and execution results.
- Behavior-to-case mapping, independent assertions and observed test outcomes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A behavioral defect makes a test fail; internal reorganization preserving the contract does not require rewriting every assertion.

## Stop and recover

- Do not mock the unit's entire implementation or add tests solely for trivial coverage. Missing runners are reported without fake results.

## Example requests

- **Normal (apply):** Test invitation expiry boundaries without asserting internal helper calls.
- **edge (apply):** Test a pricing function with null coupons and zero-value discounts.
- **blocked (inspect):** Design unit cases without executing unavailable tooling; label unrun checks.
