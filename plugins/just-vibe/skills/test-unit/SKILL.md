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

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Isolated contracts and invariants with minimal justified mocks.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Identify observable inputs/outputs, choose meaningful boundaries, create focused tests, check error cases, and run the relevant suite.
- Select a public behavior and independent expected result, use minimal valid fixtures and cover a meaningful invalid or boundary input without asserting private implementation steps.

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
