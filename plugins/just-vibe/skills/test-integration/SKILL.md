---
name: test-integration
description: "Verify real component and dependency interactions. Use for real component/dependency contracts; test-unit isolates logic and test-e2e covers a user journey."
---

# test-integration

Verify real component and dependency interactions.

## Choose this workflow

Use for real component/dependency contracts; test-unit isolates logic and test-e2e covers a user journey.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; interacting components, actual dependency types, contracts, and isolated environment.

**Pack prerequisites:** Defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Requested bounded verification may use owned isolated fixtures without authorizing product edits or live-system tests. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

- **Infer from evidence:** Read behavior contracts, existing runners and test conventions; distinguish fixture setup failure from a behavioral failure.
- **Reasonable default:** Use the smallest existing local runner and isolated synthetic fixtures that distinguish the requested behavior. When the method needs a library, runner, container runtime or load tool the project lacks, name the exact package or tool, the files it changes and any download, and add it only when the request authorizes new dev dependencies or tools; label a hand-written generator without shrinking, or a fake in place of a real dependency, as such.
- **Ask only when needed:** Ask about an unresolved contract that changes the expected result, or the target/load limits before external testing; do not ask the user to choose a runner already configured.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Real boundaries such as database transactions, serialization, queues, or service adapters.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Choose an authorized isolated dependency instance or existing fixture environment, and control data identity with setup and cleanup.
2. Exercise the actual interfaces, verifying persistence, serialization and failure cleanup across the boundary.
3. Record what remains mocked.

## Technical method

- **Inspect:** Locate the real serialization, database, process or provider boundary and isolated test target.
- **Method:** Exercise actual boundary semantics with deterministic fixtures and cleanup after partial setup.
- **Avoid misdiagnosis:** An in-memory substitute may not match transaction isolation, collation or permission behavior of the deployed engine.
- **Check the result:** Test one success and a boundary failure on the intended technology/version and report which dependencies remain simulated.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Testing worked example](../../references/examples/testing.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves windows desktop, ui automation, cross-agent regression, benchmark harness; load only the matching method: [Desktop and cross-host regression testing](../../references/methods/desktop-regression.md).

## Decision branches

- **When only a fake dependency is available:** Label contract assumptions and avoid claiming the real database/provider was exercised.

## Deliver and verify

- Integration tests with reproducible environment instructions, dependency/version, fixture lifecycle and normal/error/rollback observations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A schema/serialization mismatch is caught; a failed transaction leaves no partial committed effect.

## Stop and recover

- No shared/production database use by assumption. Inaccessible dependencies produce blocked checks, not replacement mocks labeled as real integration.

## Example requests

- **Normal (apply):** Test actual transaction rollback against an isolated database.
- **Edge (apply):** Test a database write failure that must leave no partial order.
- **Blocked (inspect):** Design integration tests without service credentials or provisioning a database.
