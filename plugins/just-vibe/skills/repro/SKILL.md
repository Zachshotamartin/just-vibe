---
name: repro
description: "Create a minimal, reliable reproduction of a problem"
---

# repro

Create a minimal, reliable reproduction of a problem

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; failure report, expected behavior, and environment constraints.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Minimal reproducer in an agreed scratch/test location; not a product fix.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Confirm the symptom, reduce unrelated dependencies and data, preserve the failure trigger, and document exact run/reset steps.

## Deliver and verify

- Reproduction fixture or script with expected versus actual behavior and environment identity.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A fresh isolated run reproduces the issue; removing the critical trigger makes the failure disappear.

## Stop and recover

- Redact production data and secrets. If reduction changes the symptom, keep the last valid reproducer and report the limit.

## Example request

Create an isolated minimal reproduction of the double-submission bug.
