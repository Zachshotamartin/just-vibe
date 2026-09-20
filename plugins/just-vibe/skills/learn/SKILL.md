---
name: learn
description: "Extract a reusable lesson from completed work for review Use to extract a candidate reusable lesson from observed work; remember persists an authorized convention."
---

# learn

Extract a reusable lesson from completed work for review

## Choose this workflow

Use to extract a candidate reusable lesson from observed work; remember persists an authorized convention.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; completed task or incident and supporting evidence.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Extract a reusable lesson for review; no automatic permanent rule installation.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify the actual cause and successful intervention, separate generalizable conditions from accidents, and test the lesson against a counterexample.
- Link the failure trigger to the successful intervention and test a plausible exception; state when the lesson should not apply.

## Technical method

- **Inspect:** Inspect a completed task's actual failure, correction and verified result.
- **Apply:** Extract a scoped reusable lesson with its trigger and limits; save only when requested in the approved location.
- **Avoid misdiagnosis:** Generalizing one incident into an unconditional global rule can harm unrelated work.
- **Check the result:** Check the lesson against both the triggering case and a nearby case where it should not apply.

## Decision branches

- **When evidence comes from one transient incident:** Keep the lesson conditional and propose a validation case instead of a universal rule.

## Deliver and verify

- Proposed lesson with trigger, action, evidence, exceptions, and suggested scope.
- Trigger/action/evidence/exception record and suggested adoption scope.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A transient outage does not become a universal coding rule; an applicable repeated failure yields a bounded recommendation.

## Stop and recover

- Missing evidence limits the output to a hypothesis. Persist behavioral changes only when the user requests adoption.

## Example requests

- **Normal (plan):** Extract a scoped lesson from this retry incident for review, not adoption.
- **edge (plan):** Extract a lesson from a flaky test caused by shared state.
- **blocked (inspect):** Analyze a failed session with no verified fix; keep causes and lessons provisional.
