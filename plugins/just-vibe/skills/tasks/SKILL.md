---
name: tasks
description: "Convert a brief or plan into ordered, verifiable tasks"
---

# tasks

Convert a brief or plan into ordered, verifiable tasks

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; accepted brief/spec/plan and optional tracking format.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Break work into implementable units; external issue creation is separate and requires a request to submit.

None by default. Plan artifacts may be saved when requested.

## Execute

- Preserve requirements, map dependencies, define bounded outputs and checks, order the critical path, and flag tasks needing a decision.

## Deliver and verify

- Ordered tasks with scope, dependencies, acceptance criteria, and traceability to the brief.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Every required outcome maps to a task; tasks do not duplicate ownership of the same inseparable change.

## Stop and recover

- Do not create estimates, owners, or external tickets as established facts when none were supplied.

## Example request

Break the accepted invitation spec into ordered tasks with acceptance checks.
