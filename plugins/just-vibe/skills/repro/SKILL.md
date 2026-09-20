---
name: repro
description: "Create a minimal, reliable reproduction of a problem Use to isolate an observable failure; fix changes production behavior after the trigger is understood."
---

# repro

Create a minimal, reliable reproduction of a problem

## Choose this workflow

Use to isolate an observable failure; fix changes production behavior after the trigger is understood.

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
- Freeze input and environment identity, reduce one dimension at a time, and include a negative control that removes the suspected trigger.

## Technical method

- **Inspect:** Capture exact input, environment, revision and the observable failure oracle.
- **Apply:** Reduce dependencies and data while preserving the causal trigger; keep synthetic substitutes faithful to the failing boundary.
- **Avoid misdiagnosis:** A smaller program with a different failure does not reproduce the original bug.
- **Check the result:** Run from a clean isolated setup and show the same expected-versus-actual mismatch with bounded execution.

## Decision branches

- **When reducing the case removes the failure intermittently:** Preserve the last reliable reproduction and quantify repeats instead of discarding timing evidence.

## Deliver and verify

- Reproduction fixture or script with expected versus actual behavior and environment identity.
- Isolated reproduction, exact run/reset steps, expected/actual output and required conditions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A fresh isolated run reproduces the issue; removing the critical trigger makes the failure disappear.

## Stop and recover

- Redact production data and secrets. If reduction changes the symptom, keep the last valid reproducer and report the limit.

## Example requests

- **Normal (apply):** Create an isolated minimal reproduction of the double-submission bug.
- **edge (apply):** Reproduce an order-dependent test failure without copying production secrets.
- **blocked (inspect):** Describe a reproduction plan when the affected binary is unavailable.
