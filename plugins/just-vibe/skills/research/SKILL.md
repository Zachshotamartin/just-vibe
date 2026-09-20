---
name: research
description: "Investigate a technical question with sources and a recommendation Use when a decision needs current external evidence; compare handles already supplied alternatives."
---

# research

Investigate a technical question with sources and a recommendation

## Choose this workflow

Use when a decision needs current external evidence; compare handles already supplied alternatives.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; technical question, constraints, and decision deadline. Requires local evidence and current primary sources when claims depend on versions or external facts.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Resolve the question, not implement a preferred solution.

None by default. Plan artifacts may be saved when requested.

## Execute

- Form answerable subquestions, inspect project constraints, consult authoritative sources, compare evidence dates, and distinguish facts from inference.
- Turn the question into compatibility claims; inspect the project's pinned versions and check primary documentation with dates and exact feature boundaries.

## Technical method

- **Inspect:** Resolve the precise question, installed versions, decision constraints and primary source availability.
- **Apply:** Search authoritative version-relevant material, distinguish quoted facts from inference and compare conflicting evidence.
- **Avoid misdiagnosis:** Current documentation may describe a different major than the project; search snippets alone can omit decisive conditions.
- **Check the result:** Link claims to supporting passages and identify the uncertainty that remains relevant to the decision.

## Decision branches

- **When authoritative sources conflict or describe another version:** State the conflict and testable assumption; do not combine incompatible APIs into one recommendation.

## Deliver and verify

- Recommendation, alternatives, citations, compatibility assumptions, and unresolved questions.
- Claim/source/version table and a recommendation conditional on unresolved facts.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Conflicting documentation is surfaced; an unsupported feature is not recommended based on outdated examples.

## Stop and recover

- If authoritative information is unavailable, bound confidence and propose a small validation experiment instead of fabricating certainty.

## Example requests

- **Normal (inspect):** Research an incremental migration strategy for our current database version.
- **edge (inspect):** Research whether our pinned framework supports streaming on this deployment target.
- **blocked (inspect):** Assess supplied documentation only; live browsing is unavailable and prices may be stale.
