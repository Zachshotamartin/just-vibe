---
name: tasks
description: "Convert a brief or plan into ordered, verifiable tasks Use to turn an accepted plan into independently verifiable work; plan resolves architecture and sequencing first."
---

# tasks

Convert a brief or plan into ordered, verifiable tasks

## Choose this workflow

Use to turn an accepted plan into independently verifiable work; plan resolves architecture and sequencing first.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; accepted brief/spec/plan and optional tracking format.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Break work into implementable units; external issue creation is separate and requires a request to submit.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Preserve requirements, map dependencies, define bounded outputs and checks, order the critical path, and flag tasks needing a decision.
2. Assign each task one observable output and dependency edge; keep inseparable schema/client changes together or state their compatibility bridge.
## Technical method

- **Inspect:** Read the accepted scope, dependency graph, owners where known and completion evidence.
- **Method:** Create tasks with a verifiable outcome and prerequisites; split by coherent behavior rather than arbitrary file count.
- **Avoid misdiagnosis:** Marking a task complete because its code exists overlooks unrun verification or blocked integration.
- **Check the result:** Check that all acceptance criteria have an owner task and that dependent tasks cannot complete ahead of missing prerequisites.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).

## Decision branches

- **When tasks overlap the same shared interface:** Define an integration order and owner boundary before parallel work is proposed.

## Deliver and verify

- Ordered tasks with scope, dependencies, acceptance criteria, and traceability to the brief.
- Task IDs, requirements covered, prerequisites, deliverables and acceptance checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Every required outcome maps to a task; tasks do not duplicate ownership of the same inseparable change.

## Stop and recover

- Do not create estimates, owners, or external tickets as established facts when none were supplied.

## Example requests

- **Normal (plan):** Break the accepted invitation spec into ordered tasks with acceptance checks.
- **edge (plan):** Split a migration plan into tasks that leave every intermediate release usable.
- **blocked (inspect):** Break down known work while keeping an unresolved provider choice as a dependency.
