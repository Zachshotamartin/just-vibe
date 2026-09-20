---
name: verify
description: "Run relevant checks and report supporting evidence"
---

# verify

Run relevant checks and report supporting evidence

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply because checks may create artifacts; target change and claimed success criteria. Inspect mode reads existing evidence only.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Relevant tests, builds, type checks, and runtime validation; no automatic repairs.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

1. Read the relevant package scripts and changed behavior before choosing checks. Identify scripts that install, deploy, seed shared databases or make external calls before running them.
2. Execute the relevant bounded checks with the active host tool and capture actual exit code, revision, output summary and any generated artifacts. Use read-only existing evidence in inspect mode.
3. Do not repair failures unless the user also requested repair. Keep failed, blocked and unrun checks separate from passes; identify pre-existing failures only with evidence.

Task-specific method: Select checks from project scripts and changed behavior, inspect commands for side effects, run bounded checks, and associate results with the tested revision.

## Deliver and verify

- Check results, exit statuses, covered criteria, and blocked/unverified areas.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A failing command produces a failed result; unavailable dependencies remain blocked rather than skipped into an overall pass.

## Stop and recover

- Do not run deployment scripts as verification. Separate pre-existing failures from introduced failures using evidence.

## Example request

Verify this checkout change using the project checks; report blocked checks.
