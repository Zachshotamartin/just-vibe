---
name: do
description: "Alias for `auto`, preserving a direct multi-step request entry point Alias for auto."
---

# do

Alias for `auto`, preserving a direct multi-step request entry point

This is an alias. Read [auto](../auto/SKILL.md) and use its implementation and run counters.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Same as `auto`; a free-form multi-step goal and the same optional controls.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Public alias for the automatic router, not a second implementation.

None by default. Plan artifacts may be saved when requested.

## Execute

1. Read the adjacent auto skill and delegate to its single router in the current host. Preserve invokedAs=do and canonical command=auto in the same run record.
2. Do not create a second route, reload the full catalog, reset the budget, or count the alias as a workflow stage.

Task-specific method: Normalize the command ID to `auto` while preserving the original brief and invoked name in the run record. Execute exactly the shared router procedure.

## Deliver and verify

- The same result and evidence contract as `auto`.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Equivalent `do` and `auto` briefs resolve the same constraints and permissions; usage does not introduce an extra nested routing stage.

## Stop and recover

- Shares the same budget counter, stop conditions, and availability. Alias metadata must not independently mark an unimplemented router as available.

## Example request

Investigate slow checkout, fix the cause, and prepare a PR description without posting.
