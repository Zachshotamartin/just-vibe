---
name: brainstorm
description: "Generate distinct approaches and explain their tradeoffs. Use to generate meaningfully different approaches before selection; decide evaluates a bounded shortlist."
---

# brainstorm

Generate distinct approaches and explain their tradeoffs.

## Choose this workflow

Use to generate meaningfully different approaches before selection; decide evaluates a bounded shortlist.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; problem, audience, constraints, and desired breadth. Requires the brief, with repository context when relevant.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Generate distinct viable approaches; no implementation or final product commitment.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Restate the objective, then vary actual mechanisms such as ownership, interaction or persistence; include a minimal approach and discard duplicates.
2. For each remaining candidate explain its benefits and costs and attach a cheap validation experiment.

## Technical method

- **Inspect:** Read the goal, hard constraints, existing approach and the kind of variation the user needs.
- **Method:** Generate options that differ in actual mechanism or tradeoff and explain the constraint each option addresses.
- **Avoid misdiagnosis:** Renaming the same architecture repeatedly is not useful diversity; brainstorming does not select or implement an option.
- **Check the result:** Remove infeasible duplicates and make the decisive tradeoff between surviving options explicit.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When constraints eliminate most options:** Keep a small feasible set rather than adding cosmetic variants to meet a count.

## Deliver and verify

- A bounded set of distinct options with tradeoffs and a validation experiment for each, and a justified shortlist.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Alternatives differ in actual behavior or architecture; all respect explicit constraints such as no new service.

## Stop and recover

- Identify impossible constraint combinations. Avoid padding the output with renamed versions of the same idea.

## Example requests

- **Normal (plan):** Find distinct ways to reduce onboarding steps while preserving required consent.
- **Edge (plan):** Brainstorm offline collaboration without introducing a server.
- **Blocked (inspect):** Generate approaches from this brief; user research is unavailable, so label adoption assumptions.
