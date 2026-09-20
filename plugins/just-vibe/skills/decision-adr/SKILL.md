---
name: decision-adr
description: "Write a decision record with alternatives and consequences Use to record a proposed or adopted architectural decision; decide determines a recommendation first."
---

# decision-adr

Write a decision record with alternatives and consequences

## Choose this workflow

Use to record a proposed or adopted architectural decision; decide determines a recommendation first.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; proposed/adopted decision, context, alternatives, and destination when saving.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

- **Infer from evidence:** Recover hard constraints, the current option, adoption status and stated priorities from the brief and prior decisions.
- **Reasonable default:** Compare feasible options qualitatively when weights were not supplied; make a reversible conditional recommendation when useful.
- **Ask only when needed:** Ask only about a missing constraint or preference that could reverse the recommendation; do not demand a complete scoring questionnaire.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Record one architectural decision with status and consequences; no new approval or implementation.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Inspect existing ADR conventions, separate actual agreement from recommendation, capture rationale and tradeoffs, and link superseded decisions.
2. Follow existing numbering/status conventions; include context, alternatives, consequences and links to superseded records without rewriting history.
## Technical method

- **Inspect:** Read the decision context, proposal history, acceptance evidence and affected contracts.
- **Method:** Record status, alternatives, consequences, rejected reasons and a concrete revisit trigger without rewriting prior rationale.
- **Avoid misdiagnosis:** An agent recommendation is not an adopted organizational decision.
- **Check the result:** Link each claimed constraint to evidence and distinguish proposed, accepted and superseded records.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Decisions worked example](../../references/examples/decisions.md).


## Decision branches

- **When adoption is not confirmed:** Keep status proposed and distinguish the recommendation from actual agreement.

## Deliver and verify

- ADR with context, decision, alternatives, consequences, status, and revisit triggers.
- ADR text with status, rationale, consequences and supersession links where applicable.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A proposed choice remains proposed; a superseding ADR preserves the older record and links it.

## Stop and recover

- Do not manufacture dates, participants, or consent. Save only in the requested or established documentation location.

## Example requests

- **Normal (plan):** Draft an ADR for the proposed shared identity service; keep status proposed.
- **edge (plan):** Write an ADR that supersedes an earlier database decision.
- **blocked (inspect):** Draft an ADR without known meeting dates or approvers; do not invent them.
