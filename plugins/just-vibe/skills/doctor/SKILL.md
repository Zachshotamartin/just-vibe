---
name: doctor
description: "Diagnose installation and configuration problems"
---

# doctor

Diagnose installation and configuration problems

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; just-vibe host, installation source, and scope. Requires host CLI discovery.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Installation/configuration diagnosis; repairs go through an explicitly requested setup/update operation.

None by default. Plan artifacts may be saved when requested.

## Execute

1. Resolve the bundled installer, then run its doctor operation for the requested host, source and Claude scope. Infer the active host only when unambiguous; --local means a complete persistent source checkout.
2. Report actual prerequisite, marketplace, installation and enablement results. Do not run setup/update or edit configuration to make a status question pass. Unknown inventory formats and conflicts remain actionable blockers.

Task-specific method: Check prerequisites, marketplace identity, inventory format, installation and enablement, and report the first actionable mismatch without changing settings.

## Deliver and verify

- Status, evidence, and exact remedy for each diagnosed problem.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Disabled and absent plugins are distinguished; an unexpected marketplace source blocks a healthy result.

## Stop and recover

- Unknown host output is not guessed. Never delete caches or edit global configuration as an automatic diagnostic step.

## Example request

Check the Claude project-scope just-vibe installation without changing it.
