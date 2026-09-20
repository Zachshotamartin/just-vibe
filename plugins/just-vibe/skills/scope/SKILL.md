---
name: scope
description: "Separate the essential release from optional work Use to choose a feasible release boundary under constraints; spec defines behavior within that boundary."
---

# scope

Separate the essential release from optional work

## Choose this workflow

Use to choose a feasible release boundary under constraints; spec defines behavior within that boundary.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; proposed work, must-have outcomes, deadline/resources, and constraints.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Release boundaries and sequencing; no removal of already required behavior without identifying that tradeoff.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify user outcomes, map dependencies, distinguish essentials from enhancements, and assess what remains viable under the limits.
- Trace each proposed cut through a complete user journey and its operational dependencies; preserve the smallest usable outcome.

## Technical method

- **Inspect:** Identify the core user outcome, hard deadline/resources and dependencies between requested capabilities.
- **Apply:** Separate essential behavior from enhancements while preserving a usable end-to-end path.
- **Avoid misdiagnosis:** Dropping error recovery or required authorization can make a smaller release unusable rather than merely simpler.
- **Check the result:** Verify the retained scope completes the core journey and list deferred items with their explicit impact.

## Decision branches

- **When the remaining scope still exceeds a hard limit:** Offer concrete tradeoffs in outcome, deadline or resources instead of unsupported estimates.

## Deliver and verify

- Included/excluded work, minimum release criteria, later phases, and consequences of cuts.
- Included journeys, explicit cuts, dependency consequences and minimum release checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Deferred work does not break an included journey; an impossible deadline is exposed with concrete options.

## Stop and recover

- Do not quietly reinterpret a hard requirement as optional. Mark unresolved priority choices and continue dependency analysis.

## Example requests

- **Normal (plan):** Scope a first release of team billing that three people can maintain.
- **edge (plan):** Reduce a launch scope while preserving signup, purchase and refund recovery.
- **blocked (inspect):** Scope this feature without effort history; identify estimates requiring a spike.
