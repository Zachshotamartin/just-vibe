---
name: research
description: "Investigate a technical question with sources and a recommendation"
---

# research

Investigate a technical question with sources and a recommendation

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

## Deliver and verify

- Recommendation, alternatives, citations, compatibility assumptions, and unresolved questions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Conflicting documentation is surfaced; an unsupported feature is not recommended based on outdated examples.

## Stop and recover

- If authoritative information is unavailable, bound confidence and propose a small validation experiment instead of fabricating certainty.

## Example request

Research an incremental migration strategy for our current database version.
