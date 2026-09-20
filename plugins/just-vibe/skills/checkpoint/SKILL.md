---
name: checkpoint
description: "Save progress, evidence, and unresolved work Use for a compact continuation snapshot; handoff adds context for a different reader."
---

# checkpoint

Save progress, evidence, and unresolved work

## Choose this workflow

Use for a compact continuation snapshot; handoff adds context for a different reader.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; current task, destination if supplied, and continuity needs.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Save task state in a local approved artifact; no permanent behavioral memory or external posting.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Capture objective, constraints, changed files/revision, completed checks, unresolved work, and exact next step; remove sensitive values.
- Record exact branch/ref and dirty-file state, tested revision, remaining success criteria and the next dependency; redact tokens and personal data.

## Decision branches

- **When a test predates intervening edits:** Retain its old revision and mark current verification pending.

## Deliver and verify

- Concise checkpoint with timestamp and evidence references.
- Timestamped state, evidence references and one executable next action.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A later session can locate the work and distinguish done from pending; stale checks retain the revision they actually tested.

## Stop and recover

- Do not overwrite an unrelated checkpoint. Ask about destination only when no established project location can be inferred.

## Example requests

- **Normal (apply):** Save the current task state to the existing project checkpoint file.
- **edge (apply):** Checkpoint work after a successful test followed by additional edits.
- **blocked (inspect):** Summarize current work without saving files or implying unavailable checks passed.
