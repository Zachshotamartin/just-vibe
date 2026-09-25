---
name: scope
description: "Separate the essential release from optional work. Use to choose a feasible release boundary under constraints; spec defines behavior within that boundary."
---

# scope

Separate the essential release from optional work.

## Choose this workflow

Use to choose a feasible release boundary under constraints; spec defines behavior within that boundary.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; proposed work, must-have outcomes, deadline/resources, and constraints.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Release boundaries and sequencing; no removal of already required behavior without identifying that tradeoff.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Identify user outcomes and distinguish essentials from enhancements.
2. Trace each proposed cut through a complete user journey and its operational dependencies, and keep the smallest usable outcome that remains viable under the limits.

## Technical method

- **Inspect:** Identify the core user outcome, hard deadline/resources and dependencies between requested capabilities.
- **Method:** Separate essential behavior from enhancements while preserving a usable end-to-end path.
- **Avoid misdiagnosis:** Dropping error recovery or required authorization can make a smaller release unusable rather than merely simpler.
- **Check the result:** Verify the retained scope completes the core journey and list deferred items with their explicit impact.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When the remaining scope still exceeds a hard limit:** Offer concrete tradeoffs in outcome, deadline or resources instead of unsupported estimates.

## Deliver and verify

- Included journeys, explicit cuts with their dependency consequences, later phases and minimum release checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Deferred work does not break an included journey; an impossible deadline is exposed with concrete options.

## Stop and recover

- Do not quietly reinterpret a hard requirement as optional. Mark unresolved priority choices and continue dependency analysis.

## Example requests

- **Normal (plan):** Scope a first release of team billing that three people can maintain.
- **Edge (plan):** Reduce a launch scope while preserving signup, purchase and refund recovery.
- **Blocked (inspect):** Scope this feature without effort history; identify estimates requiring a spike.
