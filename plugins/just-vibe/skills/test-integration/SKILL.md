---
name: test-integration
description: "Verify real component and dependency interactions Use for real component/dependency contracts; test-unit isolates logic and test-e2e covers a user journey."
---

# test-integration

Verify real component and dependency interactions

## Choose this workflow

Use for real component/dependency contracts; test-unit isolates logic and test-e2e covers a user journey.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; interacting components, actual dependency types, contracts, and isolated environment.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Real boundaries such as database transactions, serialization, queues, or service adapters.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Provision/use authorized isolated fixtures, exercise actual interfaces, control setup/cleanup, test failures, and record what remains mocked.
- Choose an isolated dependency instance or existing fixture environment, control data identity and verify persistence, serialization and failure cleanup across the actual boundary.

## Decision branches

- **When only a fake dependency is available:** Label contract assumptions and avoid claiming the real database/provider was exercised.

## Deliver and verify

- Integration tests and reproducible environment instructions with results.
- Dependency/version, fixture lifecycle and normal/error/rollback observations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A schema/serialization mismatch is caught; a failed transaction leaves no partial committed effect.

## Stop and recover

- No shared/production database use by assumption. Inaccessible dependencies produce blocked checks, not replacement mocks labeled as real integration.

## Example requests

- **Normal (apply):** Test actual transaction rollback against an isolated database.
- **edge (apply):** Test a database write failure that must leave no partial order.
- **blocked (inspect):** Design integration tests without service credentials or provisioning a database.
