---
name: help
description: "Find the right command and show examples"
---

# help

Find the right command and show examples

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; optional command name, scenario, or question. Requires the shipped catalog and actual implementation status.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Explain usage and recommend workflows; inventory browsing belongs to `tools`.

None by default. Plan artifacts may be saved when requested.

## Execute

1. Use toolkit tools with the supplied scenario and the actual target host. Read only the matching command contracts with toolkit show; do not load all skills.
2. Explain the best matching available workflow and give a prefilled invocation preserving the user constraints. If a candidate is unknown or blocked, name the precise missing task evidence or integration.
3. If the user asks installation questions, use the installed setup skill or the bundled installer help. A help question is not permission to execute the recommended workflow.

Task-specific method: Match intent, identify the best available workflow, explain required context and prerequisites, and provide a prefilled host-appropriate invocation.

## Deliver and verify

- Relevant usage instructions with availability and examples.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A scenario finds the correct specialist command; a planned command is clearly identified as unavailable.

## Stop and recover

- Do not execute the recommended workflow merely because help was requested. Fall back to installed capabilities when discovery is incomplete.

## Example request

Which command investigates good offline ML scores but poor production results?
