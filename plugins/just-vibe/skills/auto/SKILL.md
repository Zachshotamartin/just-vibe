---
name: auto
description: "Select and apply the relevant engineering workflows from an ordinary request Use for ordinary coding, debugging, review, UI, delivery, architecture or ML requests that benefit from project workflows, including multi-step tasks without a command name. Skip unrelated conversation; use a directly relevant skill when it is already selected."
---

# auto

Select and apply the relevant engineering workflows from an ordinary request

## Choose this workflow

Use for ordinary coding, debugging, review, UI, delivery, architecture or ML requests that benefit from project workflows, including multi-step tasks without a command name. Skip unrelated conversation; use a directly relevant skill when it is already selected.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply within the requested goal; objective plus arbitrary constraints, references, environment, and optional mode/budget. Requires available workflow discovery.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Smallest useful sequence completing that goal; no extra product work or authority expansion.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. When automatic hook context includes a task ID, use the adaptive-assistance guide to select and load only relevant workflows, discover the actual host tools and record meaningful evidence. If hooks are unavailable, use assist start with the current request and host session identity when known, or load the appropriate workflow directly. Do not require the user to name a command.
2. Preserve the complete brief, project, scope, constraints, success criteria and current task profile. Inspect only the context needed to choose the next useful workflow. Honor an explicit profile pin.
3. Choose quick or tracked execution using the daily-workflows guide. A small local fix, explanation or review can stay in conversation context without JSON session calls. The route utility suggests candidates, reasons and a strategy; the host resolves actual intent and effects.
4. For quick work, read the selected skill and relevant scenario guide, perform the bounded task, verify its actual output and summarize the result. Preserve user constraints and report unavailable evidence. Do not add a planning-only stop to a clear implementation request.
5. When reversibility is requested, use the task-undo guide to begin a bounded ownership record before the first edit and capture only reviewed task changes afterward. A checkpoint is not an undo snapshot. Use proof reports or the other intent helpers when the brief calls for them; do not make every small task require stored JSON.
6. Use tracked execution for dependent stages, repeated recovery, saved continuation, external mutations or requested detailed records. Create a run through session create and use session start/record/finish around meaningful stages; use session amend for additional effects and session supersede for evidence-backed alternatives. A stage whose workflow needs GitHub, Vercel, database or other external evidence also needs a fresh host capabilityReport in session start (runtime guide, Capability observations).
7. If quick work grows, carry the original brief, completed work, observations, selected profile and consumed budget into tracked context; pass the profile as a selection request with selectedBy agent unless the user pinned it. Record remaining stages; never fabricate earlier validated transitions or restart a user limit.
8. Reconcile uncertain external effects before retrying. Keep failures and stop within the applicable stage/attempt/time budget. Finish only when original success conditions are supported; report partial or blocked results plainly.
9. Check the original outcome and exclusions before each workflow transition; a new routing suggestion does not expand scope.
## Technical method

- **Inspect:** Read the complete goal, exclusions, pinned profile, project evidence and stage dependencies.
- **Method:** Choose only the needed workflows, load their technical methods and start a bounded local path; escalate bookkeeping when effects or recovery require it.
- **Avoid misdiagnosis:** Lexical routing is a suggestion, not authorization or a reason to execute every matching command.
- **Check the result:** Check each selected stage against the original outcome and carry constraints through retries, continuation and workflow changes.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Automatic routing, tool selection, missing evidence or explicit feedback needs handling: [Adaptive assistance](../../references/adaptive.md).
- Choosing quick versus tracked work: [Daily workflow paths](../../references/daily-workflows.md).
- Selecting saved-rule, alternative, exercise, proof, experiment, undo or decision support: [Intent and evidence workflows](../../references/intent-workflows.md).
- The task needs scoped memory search, a persistent goal, independent review, configuration scanning, worker control, learned-pattern review or editor installation: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).
- Discovering session, inventory, rule, council, scheduler, monitor, graph, evaluation, operator or domain-specific capabilities: [Extended capabilities and optional method library](../../references/runtime-expansion.md).

## Decision branches

- **When one bounded local workflow is sufficient:** Use the quick path; keep essential context and evidence in conversation without formal stage bookkeeping.
- **When dependencies, repeated recovery, continuation or external effects need tracking:** Use the existing validated session operations; retain earlier evidence and consumed limits when escalating.

## Deliver and verify

- Goal result, selected workflows, verification, and any incomplete steps.
- Original criteria mapped to evidence, stage history, supersessions and remaining work.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A no-dependencies constraint survives every stage; missing prerequisites trigger a valid alternative or blocker, not invented execution.

## Stop and recover

- Tracked defaults are eight stages and three attempts per stage, with no wall-clock limit unless the user sets budget.maxMinutes. Quick work honors user limits and switches to tracked handling when needed; neither path permits recursive auto/do or unrequested external effects.

## Example requests

- **Normal (apply):** Fix the checkout bug, add meaningful regression coverage, and verify; no new dependencies.
- **edge (apply):** Finish a task using local artifacts after a remote diagnostic stage is blocked.
- **blocked (inspect):** Inspect a route with missing access; do not invent credentials or claim blocked actions ran.
