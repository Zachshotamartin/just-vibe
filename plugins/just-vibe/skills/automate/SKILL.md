---
name: automate
description: "Turn a repetitive process into a script or workflow"
---

# automate

Turn a repetitive process into a script or workflow

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; repeated process, trigger, inputs, destinations, and error expectations.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Script or workflow implementing the process; registering schedules or enabling external triggers requires that requested action.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Observe current steps, isolate deterministic operations, validate inputs, implement failure reporting and repeat behavior, and test with controlled fixtures.

## Deliver and verify

- Runnable automation, usage, required permissions, and execution evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Repeated execution has deliberate duplicate handling; partial failure exits clearly and preserves recoverable state.

## Stop and recover

- Do not embed credentials, create unsolicited scheduled jobs, or automate ambiguous human decisions without an explicit rule.

## Example request

Create a repeatable local script to validate our release artifacts.
