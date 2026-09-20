---
name: test-fixtures
description: "Create representative, maintainable test data Use for controlled test data and factories; data-profile inspects real datasets."
---

# test-fixtures

Create representative, maintainable test data

## Choose this workflow

Use for controlled test data and factories; data-profile inspects real datasets.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; behaviors, schema, edge cases, existing factories, and privacy constraints.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Requested bounded verification may use owned isolated fixtures without authorizing product edits or live-system tests. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

- **Infer from evidence:** Read behavior contracts, existing runners and test conventions; distinguish fixture setup failure from a behavioral failure.
- **Reasonable default:** Use the smallest existing local runner and isolated synthetic fixtures that distinguish the requested behavior.
- **Ask only when needed:** Ask about an unresolved contract that changes the expected result, or the target/load limits before external testing; do not ask the user to choose a runner already configured.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Representative deterministic test data and lifecycle helpers.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Derive minimal realistic entities, encode valid defaults and deliberate invalid cases, isolate identities/timestamps, and verify cleanup and repeatability.
2. Define valid defaults and deliberate invalid variants, isolate identifiers and clocks and make teardown safe after partial setup failure.
## Technical method

- **Inspect:** Identify representative valid defaults, intentional invalid variants, ownership and cleanup requirements.
- **Method:** Construct minimal realistic data with explicit timestamps/IDs and independent expected values; avoid production data copies.
- **Avoid misdiagnosis:** A globally shared mutable fixture can make tests order-dependent; overly permissive mocks erase real constraints.
- **Check the result:** Run fixtures concurrently or in different orders and verify cleanup after failure plus the expected invalid-case rejection.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Testing worked example](../../references/examples/testing.md).


## Decision branches

- **When random generation makes failures hard to reproduce:** Use a recorded seed and expose the important boundary explicitly.

## Deliver and verify

- Fixtures/factories with semantics, usage, and consistency checks.
- Fixture contract, edge variants, cleanup behavior and concurrent-use checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Two concurrent tests do not collide on shared identifiers; boundary cases remain explicit rather than accidental random data.

## Stop and recover

- Never copy raw production personal data for convenience. Avoid large opaque snapshots that hide which conditions matter.

## Example requests

- **Normal (apply):** Build deterministic organization fixtures safe for concurrent test runs.
- **edge (apply):** Create fixtures that remain isolated when tests run in parallel.
- **blocked (inspect):** Design fixtures without copying production personal records.
