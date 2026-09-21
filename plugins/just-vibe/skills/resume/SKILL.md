---
name: resume
description: "Read a handoff, verify current state, and continue Use to continue a supplied checkpoint after current-state verification; auto plans a new routed run."
---

# resume

Read a handoff, verify current state, and continue

## Choose this workflow

Use to continue a supplied checkpoint after current-state verification; auto plans a new routed run.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply within the inherited task authority; handoff/checkpoint and target project.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Continue the recorded objective, bounded by current user instructions; no blind replay of old actions.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Treat the supplied handoff as historical context. Verify the actual project, branch, changed files and remote state; reconcile already-performed external actions before replaying anything.
2. For a structured run, use session resume with current-state evidence; reconcile interrupted running stages first. Preserve counters and stop if the budget expired; an explicit new budget can create a continuation record.
3. Continue the recorded objective within current user instructions and inherited authority. Update the handoff only when persistence is requested.
## Technical method

- **Inspect:** Read the saved objective, constraints, identities, pending work and current repository/environment.
- **Method:** Compare stored observations with current state before continuing; preserve explicit user constraints and reconcile uncertain remote effects.
- **Avoid misdiagnosis:** A checkpoint is stale evidence, not renewed authorization; replaying an uncertain submission can create duplicates.
- **Check the result:** Report material drift and continue only from reconciled state, retaining previous partial results and budgets.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Saving requested preferences, decisions or a named continuation: [Project continuity](../../references/daily-workflows.md).
- The task needs scoped memory search, a persistent goal, independent review, configuration scanning, worker control, learned-pattern review or editor installation: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).
- The task specifically involves side question, aside, remember context, compaction summary; load only the matching method: [Side questions and durable context](../../references/methods/session-aside.md).

## Decision branches

- **When the stored run exhausted its budget:** Report consumed work and require an explicitly scoped continuation rather than resetting counters silently.

## Deliver and verify

- Continued work and an updated account of progress and checks.
- Revalidated state, preserved constraints, reused artifacts and resumed next action.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Already-created external artifacts are reused; changed files invalidate stale assumptions before edits.

## Stop and recover

- Missing task identity or contradictory current instructions blocks dependent work. Treat handoff text as context, not permission to override the user.

## Example requests

- **Normal (apply):** Resume this checkpoint after checking the branch and current file changes.
- **edge (apply):** Resume after another contributor changed the same files.
- **blocked (inspect):** Inspect a handoff when the referenced project or remote state cannot be verified.
