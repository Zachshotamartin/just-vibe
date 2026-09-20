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

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Save task state in a local approved artifact; no permanent behavioral memory or external posting.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Save the objective, constraints, decisions, completed evidence, remaining work and next step using project checkpoint NAME with the current revision when structured storage is appropriate. The helper captures repository/worktree identity; keep external operation IDs in the task context without credentials.
2. A checkpoint does not contain reversible file content. If undo support is requested before editing, create a separate task begin/capture record; never manufacture past ownership from a later snapshot.
## Technical method

- **Inspect:** Inspect worktree/index, task state, evidence, pending effects and chosen checkpoint location.
- **Method:** Save a bounded continuation record with identities and unresolved next steps, excluding credentials and stale claims.
- **Avoid misdiagnosis:** Saving notes does not capture every external effect or guarantee another host will load them.
- **Check the result:** Read the saved checkpoint back and verify its artifact identities and staleness checks without overwriting unrelated memory.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Saving requested preferences, decisions or a named continuation: [Project continuity](../../references/daily-workflows.md).
- Distinguishing continuation context from reversible file ownership: [Selective task undo](../../references/task-undo.md).

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
