---
name: plan
description: "Inspect the project and produce a concrete implementation plan Use for implementation sequencing against existing code; tasks breaks an accepted plan into work items."
---

# plan

Inspect the project and produce a concrete implementation plan

## Choose this workflow

Use for implementation sequencing against existing code; tasks breaks an accepted plan into work items.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; objective or existing spec plus constraints and scope. Requires repository inspection.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

An executable implementation sequence grounded in this project; no feature implementation.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Find affected modules, check existing patterns, order dependencies, identify verification and rollout needs, and separate discovery tasks from known changes.
2. Connect each step to actual files, interfaces and a completion check; put discovery before changes that depend on uncertain contracts.
## Technical method

- **Inspect:** Inspect relevant code, dependencies, current tests and the requested result.
- **Method:** Order concrete changes by dependency and attach discriminating checks and recovery boundaries to consequential steps.
- **Avoid misdiagnosis:** A list of filenames or tool names is not an implementation plan; invented repo structure produces unusable tasks.
- **Check the result:** Ensure each step maps to an observed location or justified new artifact and contributes to a stated acceptance criterion.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When a required integration cannot be inspected:** Plan a contract seam and isolated fixture, then identify the live verification prerequisite separately.

## Deliver and verify

- File/component-level steps, success criteria, risks, recovery approach, and dependencies.
- Ordered change table with target files, dependencies, checks and rollback boundaries.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A developer can start the first task without guessing its target; a missing integration is an explicit prerequisite rather than assumed available.

## Stop and recover

- Do not estimate unknown work as certain. Ask only for decisions that change the plan materially.

## Example requests

- **Normal (plan):** Plan adding saved filters to the existing search page without new dependencies.
- **edge (plan):** Plan a backward-compatible API change with old clients still active.
- **blocked (inspect):** Plan from this partial repository; external service schemas are unavailable.
