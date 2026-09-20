---
name: learn
description: "Extract a reusable lesson from completed work for review"
---

# learn

Extract a reusable lesson from completed work for review

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

## Deliver and verify

- Proposed lesson with trigger, action, evidence, exceptions, and suggested scope.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A transient outage does not become a universal coding rule; an applicable repeated failure yields a bounded recommendation.

## Stop and recover

- Missing evidence limits the output to a hypothesis. Persist behavioral changes only when the user requests adoption.

## Example request

Extract a scoped lesson from this retry incident for review, not adoption.
