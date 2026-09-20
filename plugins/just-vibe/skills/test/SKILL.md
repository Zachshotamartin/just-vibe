---
name: test
description: "Add meaningful coverage for specified behavior"
---

# test

Add meaningful coverage for specified behavior

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

## Deliver and verify

- Tests, fixture changes when necessary, execution results, and covered behavior.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A realistic behavioral regression fails the new test; harmless internal refactoring does not invalidate assertions.

## Stop and recover

- Report unavailable services/runners. Avoid tests that merely restate implementation or require live paid endpoints without authorization.

## Example request

Add meaningful coverage for expired invitations and repeated acceptance.
