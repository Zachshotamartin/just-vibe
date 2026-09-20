---
name: handoff
description: "Write a self-contained brief for another session or collaborator Use when another person or session needs context to continue; checkpoint is a shorter state capture."
---

# handoff

Write a self-contained brief for another session or collaborator

## Choose this workflow

Use when another person or session needs context to continue; checkpoint is a shorter state capture.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, intended recipient/session, and optional output path.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Produce a self-contained handoff; creating tasks, sending messages, or assigning ownership is separate.

None by default. Plan artifacts may be saved when requested.

## Execute

- Reconstruct the original objective, summarize verified state, include decisions and constraints, document blockers, and provide actionable continuation steps.
- Reconstruct the original goal and accepted decisions, separate proposed from completed work, and identify files or artifacts needed for the next step.

## Decision branches

- **When external action outcome is uncertain:** Include its operation identity and reconciliation step rather than instructing a blind retry.

## Deliver and verify

- Handoff brief with file links, commands already run, results, and next action; save when requested.
- Self-contained goal, constraints, evidence, blockers and continuation sequence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A reader needs no hidden conversation history; proposed changes are not described as completed.

## Stop and recover

- Exclude credentials and unnecessary personal details. Do not transmit the handoff without a sending instruction.

## Example requests

- **Normal (plan):** Write a self-contained handoff for the partially implemented checkout fix.
- **edge (plan):** Hand off an interrupted release with an uncertain upload result.
- **blocked (inspect):** Prepare a handoff from partial history; label decisions whose rationale is missing.
