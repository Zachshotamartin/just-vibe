---
name: spec
description: "Produce requirements, acceptance criteria, and edge cases. Use to define observable product behavior before implementation; a PRD is a specification, and plan derives the implementation plan from it."
---

# spec

Produce requirements, acceptance criteria, and edge cases.

## Choose this workflow

Use to define observable product behavior before implementation; a PRD is a specification, and plan derives the implementation plan from it.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; feature brief, users, constraints, and relevant existing contracts.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Requirements and observable behavior; no code changes or invented business policy.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Inspect current behavior, then write actors, preconditions and state transitions with normal and error paths.
2. Give observable acceptance examples, record exclusions, and turn ambiguity into explicit assumptions or decisions, separating business decisions from implementation preferences.

## Technical method

- **Inspect:** Resolve actors, desired outcomes, existing contracts and meaningful exclusions.
- **Method:** Define observable acceptance criteria and state transitions, including invalid, interrupted and recovered behavior where material.
- **Avoid misdiagnosis:** Implementation detail can prematurely constrain a product requirement; vague adjectives cannot establish completion.
- **Check the result:** Walk a representative user scenario and a failure scenario against the criteria and expose unresolved choices.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- The user asks for a PRD: [PRD, implementation plans and team handoffs](../../references/methods/planning-teams.md).

## Decision branches

- **When two requirements conflict on the same transition:** Surface the concrete conflicting example and resolve that decision before specifying dependent behavior.

## Deliver and verify

- Requirements with IDs, acceptance examples, edge cases, compatibility needs, exclusions and unresolved questions with their decision owners; save only when requested.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Each requirement has an observable completion condition; conflicting requirements are flagged before downstream implementation.

## Stop and recover

- Do not silently choose billing, privacy, or access policy that needs the user's decision. Continue specifying independent behavior.

## Example requests

- **Normal (plan):** Specify organization invitations, including expiry and already-registered users.
- **Edge (plan):** Specify account deletion with a pending subscription and recoverable failure.
- **Blocked (inspect):** Draft a specification with unknown retention policy; leave that decision explicit.
