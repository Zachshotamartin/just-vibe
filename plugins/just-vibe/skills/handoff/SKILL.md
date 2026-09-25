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

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Produce a self-contained handoff; creating tasks, sending messages, or assigning ownership is separate.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Reconstruct the original objective, summarize verified state, include decisions and constraints, document blockers, and provide actionable continuation steps.
2. Reconstruct the original goal and accepted decisions, separate proposed from completed work, and identify files or artifacts needed for the next step.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.
## Technical method

- **Inspect:** Resolve current objective, accepted constraints, completed artifacts, evidence and open decisions.
- **Method:** Write a self-contained brief with exact paths/revisions and the next actionable step, distinguishing facts from proposals.
- **Avoid misdiagnosis:** A conversational narrative without current state forces rediscovery; claiming unavailable checks passed misleads the next session.
- **Check the result:** Verify links/identities and ensure a reader can continue without relying on hidden conversation context or secret values.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Saving requested preferences, decisions or a named continuation: [Project continuity](../../references/daily-workflows.md).
- Saving a structured handoff with vault handoff or memory_handoff, or searching scoped memory: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).

## Decision branches

- **When external action outcome is uncertain:** Include its operation identity and reconciliation step rather than instructing a blind retry.
- **When saving the handoff is requested:** Prefer memory_handoff or vault handoff --stdin (project scope by default; team scope for teammates, reviewed through Git); otherwise use the project established handoff file.

## Deliver and verify

- Handoff brief with file links, commands already run, results, and next action; save when requested.
- Self-contained goal, constraints, evidence, blockers and continuation sequence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A reader needs no hidden conversation history; proposed changes are not described as completed.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Exclude credentials and unnecessary personal details. Do not transmit the handoff without a sending instruction.

## Example requests

- **Normal (plan):** Write a self-contained handoff for the partially implemented checkout fix.
- **edge (plan):** Hand off an interrupted release with an uncertain upload result.
- **blocked (inspect):** Prepare a handoff from partial history; label decisions whose rationale is missing.
