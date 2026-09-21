---
name: goal
description: "Create and pursue a persistent objective with completion criteria, progress, blockers and evidence Use when the user explicitly asks to establish, resume, inspect or manage a persistent goal. Use plan for a proposal alone and checkpoint for a one-time context snapshot."
---

# goal

Create and pursue a persistent objective with completion criteria, progress, blockers and evidence

## Choose this workflow

Use when the user explicitly asks to establish, resume, inspect or manage a persistent goal. Use plan for a proposal alone and checkpoint for a one-time context snapshot.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. An explicit goal request authorizes saving and progressing that objective within the requested scope. Inspect/list/resume context do not independently authorize new external actions. Never invent a token or spending budget.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Read current goals, current project instructions and evidence relevant to the named objective. Recheck old evidence against current files before resuming.

Save goal state outside the repository through the bundled runtime. Implement the requested work through the relevant workflows within existing authorization; publishing, external messages and destructive operations still require the corresponding user intent.

## Execute

1. Read the runtime goal reference. Resolve whether the user is creating a goal, resuming one, changing its scope or asking for status. Use goals_read/goal list first and reuse the matching objective instead of making duplicates. Revise completion criteria explicitly when the objective changes; prior scope evidence remains historical and does not satisfy the new criteria.
2. For a new goal, preserve the objective, constraints and concrete completion criteria with goal create. Set a native host goal as well when that capability exists and the user explicitly requested a goal; only set a native token budget if the user supplied one.
3. Carry out authorized work using the relevant just-vibe workflows and available host tools. Persist concise progress, next steps and real blockers with goal update at meaningful checkpoints. A goal does not imply permission to spawn workers or run paid services.
4. Record each criterion with goal evidence, distinguishing an attributed host report from a hashed artifact. Read goal resume after interruption, compare evidence freshness and continue the remaining work without resetting constraints.
5. Mark complete only when criteria are satisfied with current evidence and blockers cleared; synchronize the native host goal if one was created and its completion conditions are met. Reopen a completed goal when new work is requested and collect fresh verification for its pending criteria. If blocked, save the specific dependency and useful next step; do not claim completion.
## Technical method

- **Inspect:** Current goal revision, completion criteria, constraints, blockers and artifact hashes.
- **Method:** Revision-checked goal records; each criterion has attributed or hashed evidence. Native goal controls are optional and distinct from local persistence.
- **Avoid misdiagnosis:** Treating a saved objective or a process exit as completed work, or treating a goal as blanket permission for external actions.
- **Check the result:** Try completion before evidence and after an artifact changes; both must remain incomplete until resolved.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Creating, updating or resuming a goal; use the exact goal operation schemas: [Persistent goals and runtime tools](../../references/runtime-platform.md).

## Decision branches

- **When the host exposes native goal controls:** Use them for the explicitly requested goal, respecting their budgets and state rules; local records add portable criteria and evidence.
- **When a matching goal already exists:** Show or resume it, reconcile scope changes with the current request and preserve its history.
- **When there is no native goal tool:** Use the local persistent goal record and current task execution; disclose that the record does not schedule future runs.

## Deliver and verify

- Persistent goal ID, current status, completed criteria, evidence and next action.
- Implemented result or a precise unresolved blocker; a plan or saved goal alone is not completion of an implementation request.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Goal state survives a new session and preserves constraints and outstanding work.
- Completion is rejected when criteria lack evidence, artifacts changed or blockers remain.
- Native host state and local state are reported separately if either could not be updated.

## Stop and recover

- Stop dependent work when a required answer, external access or authorization is missing; continue independent authorized work.
- Respect cancellation, retirement and changed user scope. Never turn a saved goal into indefinite autonomous background work.

## Example requests

- **normal (apply):** Goal: make checkout work with discount codes and verify the failure states. Preserve the API contract.
- **edge (inspect):** Resume my checkout goal and show what remains; the validation artifact changed since yesterday.
- **blocked (apply):** Finish the deployment goal, but production credentials are not available.
