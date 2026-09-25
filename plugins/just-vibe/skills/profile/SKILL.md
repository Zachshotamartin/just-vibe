---
name: profile
description: "Set, inspect, automatically select or clear task-scoped engineering profiles. Use when the user wants to change the agent’s working priorities or asks it to choose an appropriate role; this does not execute a product task by itself."
---

# profile

Set, inspect, automatically select or clear task-scoped engineering profiles.

## Choose this workflow

Use when the user wants to change the agent’s working priorities or asks it to choose an appropriate role; this does not execute a product task by itself.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect/project-read-only; changing in-context task selection does not grant apply mode. Preserve all appended task constraints.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Relevant catalog entries, current task instructions and enough project evidence to choose responsibly.

Only active task context or a supplied run record returned as JSON. Persist to a user-requested location only when explicitly asked; never change global host settings.

## Execute

1. Read [profile selection](../../references/profiles.md), then use toolkit profiles and toolkit profile ID to find and inspect relevant roles.
2. Keep simple selection in task context. With an existing run, call session profile using run and selection; with a new explicit single role, workflow COMMAND --profile ID preserves it. Do not create a fresh run just to evade a prior pin or budget.
3. State the selected profile and its concrete task contribution briefly once. Apply relevant priorities in subsequent workflows without repeating role claims, changing permissions or scope, overriding a user pin, or forcing every suggested workflow to run.

## Technical method

- **Inspect:** Read current selection, explicit user pins, task scope and proposed primary/secondary roles.
- **Method:** Preserve pins and apply role priorities through the relevant workflow methods; record selection provenance and conflicts.
- **Avoid misdiagnosis:** Agent inference cannot clear a user pin, and a principal role does not authorize broader architecture changes.
- **Check the result:** Confirm the recorded selection and pin state match the request and that the brief, constraints and scope are unchanged.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Saving requested preferences, decisions or a named continuation: [Project continuity](../../references/daily-workflows.md).

## Decision branches

- **When the user requests auto after pinning a role:** Record a user clear with the actual request as reason, then record an unpinned agent selection based on task evidence.
- **When the agent discovers a new focus while a user selection is pinned:** Retain the selection and apply required task checks without silently changing roles.

## Deliver and verify

- Primary and secondary role IDs, selection source, task scope, pin state and short evidence-based reason.
- Relevant priorities, checks and conflicts with the task brief; original scope and permissions stay intact.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Pinned user choices survive automatic routing. Profile changes preserve brief, mode, scope, authorization, budgets, attempts and original success criteria.
- A profile never creates a subagent, installs tools, changes credentials or claims professional expertise.

## Stop and recover

- Keep an existing pin when an inferred role conflicts; ask only if an explicit conflicting request needs resolution.
- If no role fits, continue with ordinary task guidance and state that limitation. Do not invent a shipped role.

## Example requests

- **Normal (inspect):** Set machine-learning-engineer for this implementation, with mlops-engineer as a secondary focus.
- **Edge (inspect):** Use principal-engineer to review this design, but keep the change local and do not redesign the platform.
- **Blocked (inspect):** Choose automatically while frontend-engineer is pinned; preserve the pin and explain relevant task checks.
