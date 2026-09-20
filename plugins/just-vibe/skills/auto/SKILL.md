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

1. Preserve the original brief verbatim. Resolve objective, selected project, scope, constraints, success criteria, references, environment and existing session authorization. Read the shared runtime interface for the JSON run protocol.
2. Honor the active task profile described in [profile selection](../../references/profiles.md). If a role materially helps and no user pin exists, the agent may select one from task evidence. Preserve the selection across stages; a profile cannot change mode, scope, authority, budgets or original success criteria.
3. Inspect the project and current host capabilities. Use toolkit route only to narrow candidates; evaluate the actual intent and read the selected skills. Ignore keyword matches that contradict constraints, select the smallest useful route, and state it briefly.
4. Create an in-context run record through session create, including explicit successCriteria and context. Defaults are eight stages, three attempts per stage and sixty minutes; use a user-provided budget when available. No permanent state file is required.
5. Before each stage call session start with the selected command, action, target, effect and current capability evidence. Do not route to auto or do. Do not mark an integration available unless task-specific access or adequate supplied artifacts were actually observed.
6. Execute the selected skill in the active host with the original brief and constraints. Before an additional action or effect change inside a running stage, use session amend with the same stage id and all applicable effects. Exact authorization must already be present in context.authorization; this is bookkeeping, not a permission grant.
7. Call session record with observed evidence and criteria. Retain failed attempts; retry the same stage only with new evidence and budget. If a different completed stage meets an abandoned failed/blocked stage’s obligations, use session supersede with replacement ids, criterion coverage, evidence and reason. Reconcile uncertain external effects before retrying or superseding.
8. Call session finish only after checking the original success criteria. Use completed only for supported results, otherwise partial/blocked/failed/cancelled. Summarize actual changes and verification. Resume explicitly from recorded current evidence; never reset budgets to bypass a stop.

Task-specific method: Build the shared brief, inspect the project, select available workflows, state the route, execute with carried context, verify, and adapt only on new evidence. Identify original success criteria before routing; choose the smallest set of canonical workflows and re-evaluate selection when evidence changes.

## Decision branches

- **When a blocked route is replaced by a completed alternative:** Record criterion coverage with session supersede; retain failed attempts and unchanged budgets.

## Deliver and verify

- Goal result, selected workflows, verification, and any incomplete steps.
- Original criteria mapped to evidence, stage history, supersessions and remaining work.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A no-dependencies constraint survives every stage; missing prerequisites trigger a valid alternative or blocker, not invented execution.

## Stop and recover

- Eight stages/two corrective attempts per failed stage by default; no recursive `auto`/`do`, implicit paid runs, or unrequested external publication.

## Example requests

- **Normal (apply):** Fix the checkout bug, add meaningful regression coverage, and verify; no new dependencies.
- **edge (apply):** Finish a task using local artifacts after a remote diagnostic stage is blocked.
- **blocked (inspect):** Inspect a route with missing access; do not invent credentials or claim blocked actions ran.
