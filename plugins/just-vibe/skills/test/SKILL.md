---
name: test
description: "Add meaningful coverage for specified behavior Use to implement behavior checks; coverage identifies gaps and verify runs existing checks."
---

# test

Add meaningful coverage for specified behavior

## Choose this workflow

Use to implement behavior checks; coverage identifies gaps and verify runs existing checks.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; behavior to protect, target code, and existing test conventions.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Meaningful behavior coverage at the cheapest reliable layer; no arbitrary coverage quota or whole-suite rewrite.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect existing tests, identify important gaps, choose unit/integration/end-to-end scope, add representative cases, and run relevant checks.
- Choose the lowest layer that can observe the contract; retain an independent expected result and demonstrate that the check detects a plausible regression.

## Decision branches

- **When the proposed assertion mirrors internal implementation:** Replace it with an external invariant or consumer-observable result.

## Deliver and verify

- Tests, fixture changes when necessary, execution results, and covered behavior.
- Tests and fixtures mapped to requirements, execution results and uncovered boundaries.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A realistic behavioral regression fails the new test; harmless internal refactoring does not invalidate assertions.

## Stop and recover

- Report unavailable services/runners. Avoid tests that merely restate implementation or require live paid endpoints without authorization.

## Example requests

- **Normal (apply):** Add meaningful coverage for expired invitations and repeated acceptance.
- **edge (apply):** Add tests for duplicate submissions and a legitimate repeated purchase.
- **blocked (inspect):** Assess test design without the integration environment; do not mark mocks as live coverage.
