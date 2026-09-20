---
name: auto
description: "Use the goal and project context to select, execute, and verify appropriate workflows"
---

# auto

Use the goal and project context to select, execute, and verify appropriate workflows

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
2. Inspect the project and current host capabilities. Use toolkit route only to narrow candidates; evaluate the actual intent and read the selected skills. Ignore keyword matches that contradict constraints, select the smallest useful route, and state it briefly.
3. Create an in-context run record through session create, including explicit successCriteria and context. Defaults are eight stages, three attempts per stage and sixty minutes; use a user-provided budget when available. No permanent state file is required.
4. Before each stage call session start with the selected command, action, target, effect and current capability evidence. Do not route to auto or do. Do not mark an integration available unless task-specific access or adequate supplied artifacts were actually observed.
5. Execute the selected skill in the active host. Pass the same brief and all constraints; update the effect/authorization record before actions that change scope or effect class. Runtime validation is bookkeeping, not a replacement for host permissions or judgment.
6. After the action, call session record with observed evidence and criteria. On failure retain the failed attempt; retry the same stage ID only with new evidence and remaining budget. For blocked or uncertain external effects reconcile existing state before doing more.
7. Call session finish only after checking the original success criteria. Use completed only for supported results, otherwise partial/blocked/failed/cancelled. Summarize actual changes and verification. Resume explicitly from recorded current evidence; never reset budgets to bypass a stop.

Task-specific method: Build the shared brief, inspect the project, select available workflows, state the route, execute with carried context, verify, and adapt only on new evidence.

## Deliver and verify

- Goal result, selected workflows, verification, and any incomplete steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A no-dependencies constraint survives every stage; missing prerequisites trigger a valid alternative or blocker, not invented execution.

## Stop and recover

- Eight stages/two corrective attempts per failed stage by default; no recursive `auto`/`do`, implicit paid runs, or unrequested external publication.

## Example request

Fix the checkout bug, add meaningful regression coverage, and verify; no new dependencies.
