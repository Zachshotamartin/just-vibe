---
name: orchestrate
description: "Coordinate a feature, fix, refactor or MVP through scoped phases and reviewed dependent assignments. Use for a multi-phase implementation or explicitly requested worker coordination. For a small localized edit use build, fix or refactor directly; auto applies the same phase contract to multi-phase work it tracks. This workflow does not itself authorize subagents."
---

# orchestrate

Coordinate a feature, fix, refactor or MVP through scoped phases and reviewed dependent assignments.

## Choose this workflow

Use for a multi-phase implementation or explicitly requested worker coordination. For a small localized edit use build, fix or refactor directly; auto applies the same phase contract to multi-phase work it tracks. This workflow does not itself authorize subagents.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. An implementation request authorizes proportional local work. Delegate only when the current host policy and user authorization allow it. Plan mode produces a reviewable phase plan without starting workers.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Inspect current implementation, tests, repository instructions and relevant saved goals. Discover existing host tools and worker capacity; no service or worker access is assumed.

Implement only the requested feature, fix, refactor or MVP scope. Save orchestration and review state locally. Workers require explicit enablement and authorization. Publishing, external messages and destructive operations keep their own authorization boundaries.

## Execute

1. Read the composed-workflows guide. Select feature, fix, refactor or MVP based on the requested result. Inspect extension points and risks, preserve appended constraints, and identify concrete acceptance criteria. Keep one-file work on the direct workflow without unnecessary phases or agents.
2. Reuse an existing explicit goal when one exists; create a persistent goal only if requested. Choose the smallest ordered phases and relevant canonical methods. Define phase inputs, owned files, outputs and discriminating checks. Assign different writers disjoint ownership; serialize overlapping changes.
3. Execute locally by default. If delegation is authorized and useful, inspect specialists_read/workers_read, then create a bounded acyclic assignment graph. Use working-tree inputs so workers see reviewed prerequisite changes. Dispatch only ready assignments within the configured limit; never delegate merely because this workflow is selected.
4. Collect structured results, inspect actual diffs and logs, run relevant checks with workers_verify, then apply the exact reviewed result hash with workers_apply. Applied changes preserve the original index and return an undo task. Accept a prerequisite only after its evidence and current files match; process exit is insufficient.
5. Retry only a failed, cancelled or expired assignment with a concrete correction and within maxAttempts. Cancel owned workers on user cancellation. If a prerequisite changed, reconcile and obtain a fresh result before downstream dispatch. Keep partial changes and report what remains.
6. Use plan-review when the user wants browser feedback on a concrete artifact or a required design decision. Respect changed scope, continue independent work and never treat a review verdict as a deployment permission. Complete the requested implementation, verify integrated behavior and report remaining limitations.

## Technical method

- **Inspect:** Current source, acceptance criteria, dependency graph, worker baseline and result hashes, verification records and index state.
- **Method:** Phase contracts followed by a dependency DAG when delegation is authorized. Completed work enters review; only accepted current results unlock dependent work.
- **Avoid misdiagnosis:** Treating successful process exit as correctness, allowing concurrent writers to overlap, or allowing an old accepted result to unlock work after source changes.
- **Check the result:** Before each downstream dispatch, confirm every accepted result it depends on is still current and its prerequisites passed.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Coordinating feature, fix, refactor or MVP phases; use exact worker and canvas operations only when needed: [Composed workflows and reviewed coordination](../../references/composed-workflows.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).
- The task specifically involves prd, prp, team plan, delegation plan; load only the matching method: [PRD, implementation plans and team handoffs](../../references/methods/planning-teams.md).

## Decision branches

- **When the change is small:** Use the direct canonical workflow and proportional verification.
- **When authorized independent work can benefit from workers:** Create bounded assignments with explicit inputs, file ownership, dependencies and review criteria.
- **When a worker fails or a prerequisite changes:** Preserve evidence, identify the cause, and retry only within the recorded bound or create a freshly reviewed assignment.

## Deliver and verify

- Implemented result with per-phase evidence and any unresolved blocker.
- When workers were used: orchestration ID, accepted result hashes, changed paths, verification and undo task IDs.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Each phase produces the input required by its successor; dependency cycles and stale prerequisites are rejected.
- Worker application uses the reviewed result, fresh passing checks and unchanged source scope, preserving staged user work.
- The integrated result satisfies the original request; recorded completion or a plan alone is insufficient.

## Stop and recover

- Stop dependent phases on missing required evidence, unresolved overlap, authorization or required user decisions; continue independent useful work.
- Bound worker attempts and honor cancellation. Do not automatically push, publish, run paid services or spawn agents without authorization.

## Example requests

- **Normal (apply):** Build password reset end to end, preserving our session contract; coordinate the API, UI and tests.
- **Edge (apply):** Refactor the parser but preserve behavior; one file is involved so keep the work simple.
- **Blocked (plan):** Plan the MVP; identify the data ownership decision we need before implementation.
