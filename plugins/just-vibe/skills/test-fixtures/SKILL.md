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

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Representative deterministic test data and lifecycle helpers.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Derive minimal realistic entities, encode valid defaults and deliberate invalid cases, isolate identities/timestamps, and verify cleanup and repeatability.
- Define valid defaults and deliberate invalid variants, isolate identifiers and clocks and make teardown safe after partial setup failure.

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
