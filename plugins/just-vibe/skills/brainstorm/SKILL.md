---
name: brainstorm
description: "Generate distinct approaches and explain their tradeoffs"
---

# brainstorm

Generate distinct approaches and explain their tradeoffs

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; problem, audience, constraints, and desired breadth. Requires the brief, with repository context when relevant.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Generate distinct viable approaches; no implementation or final product commitment.

None by default. Plan artifacts may be saved when requested.

## Execute

- Restate the objective, vary meaningful design dimensions, discard duplicates, and explain benefits, costs, and a validation method for each remaining approach.

## Deliver and verify

- A bounded set of differentiated options and a recommended shortlist.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Alternatives differ in actual behavior or architecture; all respect explicit constraints such as no new service.

## Stop and recover

- Identify impossible constraint combinations. Avoid padding the output with renamed versions of the same idea.

## Example request

Find distinct ways to reduce onboarding steps while preserving required consent.
