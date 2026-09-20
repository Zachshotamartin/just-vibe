---
name: test-e2e
description: "Exercise complete user journeys and recovery"
---

# test-e2e

Exercise complete user journeys and recovery

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; critical journey, environment, test accounts, and external side-effect constraints.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Full user-visible flows including recovery, through real application boundaries available in the test environment.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Seed controlled data, use robust user-facing selectors, exercise the journey and failure recovery, assert observable outcomes, and clean up owned data.

## Deliver and verify

- End-to-end tests, traces on failure, and environment/coverage notes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A completed UI action has the intended persisted outcome; failed submission preserves recoverable user state.

## Stop and recover

- Do not send real payments/emails or modify user accounts without explicit scope. Missing integrations are labeled honestly.

## Example request

Test checkout error recovery using controlled test accounts and no real charges.
