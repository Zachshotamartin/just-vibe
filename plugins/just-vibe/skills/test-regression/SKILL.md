---
name: test-regression
description: "Turn a confirmed bug into a lasting behavioral check"
---

# test-regression

Turn a confirmed bug into a lasting behavioral check

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; confirmed bug, reproduction, expected behavior, and fixed/broken revisions where available.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

A durable test protecting the actual failure mechanism.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Choose the lowest reliable layer, reproduce the trigger, show failure on the broken behavior when feasible, verify the fix, and include a neighboring valid case.

## Deliver and verify

- Regression test and before/after evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The test fails for the original bug rather than incidental setup; the corrected behavior and adjacent case pass.

## Stop and recover

- If the old revision cannot run, state that limitation. Do not assert implementation details instead of the user-visible invariant.

## Example request

Turn the confirmed duplicate-credit bug into a failing-then-passing check.
