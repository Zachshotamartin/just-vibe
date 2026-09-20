---
name: auto
description: "Use the goal and project context to select, execute, and verify appropriate workflows Use to complete a bounded multi-step goal across workflows; direct commands are preferable for one clear operation."
---

# auto

Use the goal and project context to select, execute, and verify appropriate workflows

## Choose this workflow

Use to complete a bounded multi-step goal across workflows; direct commands are preferable for one clear operation.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply within the requested goal; objective plus arbitrary constraints, references, environment, and optional mode/budget. Requires available workflow discovery.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Smallest useful sequence completing that goal; no extra product work or authority expansion.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

1. Preserve the complete brief, project, scope, constraints, success criteria and current task profile. Inspect only the context needed to choose the next useful workflow. Honor an explicit profile pin.
2. Choose quick or tracked execution using the daily-workflows guide. A small local fix, explanation or review can stay in conversation context without JSON session calls. The route utility suggests candidates, reasons and a strategy; the host resolves actual intent and effects.
3. For quick work, read the selected skill and relevant scenario guide, perform the bounded task, verify its actual output and summarize the result. Preserve user constraints and report unavailable evidence. Do not add a planning-only stop to a clear implementation request.
4. When reversibility is requested, use the task-undo guide to begin a bounded ownership record before the first edit and capture only reviewed task changes afterward. A checkpoint is not an undo snapshot. Use proof reports or the other intent helpers when the brief calls for them; do not make every small task require stored JSON.
5. Use tracked execution for dependent stages, repeated recovery, saved continuation, external mutations or requested detailed records. Create a run through session create and use session start/record/finish around meaningful stages; use session amend for additional effects and session supersede for evidence-backed alternatives.
6. If quick work grows, carry the original brief, completed work, observations, selected profile and consumed budget into tracked context. Record remaining stages; never fabricate earlier validated transitions or restart a user limit.
7. Reconcile uncertain external effects before retrying. Keep failures and stop within the applicable stage/attempt/time budget. Finish only when original success conditions are supported; report partial or blocked results plainly.

Task-specific method: Choose the smallest useful workflow and proportionate execution path. Complete authorized work with carried context, meaningful verification and a clear result.

## Technical method

- **Inspect:** Read the complete goal, exclusions, pinned profile, project evidence and stage dependencies.
- **Apply:** Choose only the needed workflows, load their technical methods and start a bounded local path; escalate bookkeeping when effects or recovery require it.
- **Avoid misdiagnosis:** Lexical routing is a suggestion, not authorization or a reason to execute every matching command.
- **Check the result:** Check each selected stage against the original outcome and carry constraints through retries, continuation and workflow changes.

## Read when relevant

- Choosing quick versus tracked work: [Daily workflow paths](../../references/daily-workflows.md).
- Selecting saved-rule, alternative, exercise, proof, experiment, undo or decision support: [Intent and evidence workflows](../../references/intent-workflows.md).

## Decision branches

- **When one bounded local workflow is sufficient:** Use the quick path; keep essential context and evidence in conversation without formal stage bookkeeping.
- **When dependencies, repeated recovery, continuation or external effects need tracking:** Use the existing validated session operations; retain earlier evidence and consumed limits when escalating.

## Deliver and verify

- Goal result, selected workflows, verification, and any incomplete steps.
- Original criteria mapped to evidence, stage history, supersessions and remaining work.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A no-dependencies constraint survives every stage; missing prerequisites trigger a valid alternative or blocker, not invented execution.

## Stop and recover

- Tracked defaults remain eight stages, three attempts per stage and sixty minutes. Quick work honors user limits and switches to tracked handling when needed; neither path permits recursive auto/do or unrequested external effects.

## Example requests

- **Normal (apply):** Fix the checkout bug, add meaningful regression coverage, and verify; no new dependencies.
- **edge (apply):** Finish a task using local artifacts after a remote diagnostic stage is blocked.
- **blocked (inspect):** Inspect a route with missing access; do not invent credentials or claim blocked actions ran.
