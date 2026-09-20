---
name: test-unit
description: "Test isolated behaviors and boundaries"
---

# test-unit

Test isolated behaviors and boundaries

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; unit/behavior, edge cases, and existing test framework.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Isolated contracts and invariants with minimal justified mocks.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Identify observable inputs/outputs, choose meaningful boundaries, create focused tests, check error cases, and run the relevant suite.

## Deliver and verify

- Unit tests, fixture rationale, and execution results.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A behavioral defect makes a test fail; internal reorganization preserving the contract does not require rewriting every assertion.

## Stop and recover

- Do not mock the unit's entire implementation or add tests solely for trivial coverage. Missing runners are reported without fake results.

## Example request

Test invitation expiry boundaries without asserting internal helper calls.
