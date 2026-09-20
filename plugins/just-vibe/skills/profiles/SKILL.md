---
name: profiles
description: "Browse engineering role profiles and compare their priorities, boundaries and verification Use to discover roles; profile selects or clears the active task role, while tools discovers actions."
---

# profiles

Browse engineering role profiles and compare their priorities, boundaries and verification

## Choose this workflow

Use to discover roles; profile selects or clears the active task role, while tools discovers actions.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect only. Accept a role, discipline, level or task description as appended context.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

The shipped profile catalog and supplied task context.

No changes to active profile, project files, global settings or external state.

## Execute

1. Run toolkit profiles with the full relevant query; for specific details run toolkit profile ID. Read [profile selection](../../references/profiles.md) for scope and precedence.
2. Return a focused comparison and useful examples. Search is lexical discovery, not an authority or competence score.

Task-specific method: Search the profile catalog and group relevant roles by discipline; separate architecture specialties from seniority-oriented profiles. Explain the decisive difference between nearby roles using their priorities, decision branch and verification; do not equate titles with capabilities or seniority credentials.

## Decision branches

- **When several profiles appear relevant:** Compare primary responsibility and actual task evidence; show options without silently activating one.

## Deliver and verify

- Relevant role IDs, purpose, priorities and example use.
- Clear distinctions between close profiles and their suggested workflows.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Every listed profile exists in the installed catalog. Discovery leaves the active task selection unchanged.

## Stop and recover

- Do not activate a role, install tools or execute suggested workflows from a discovery request.

## Example requests

- **normal (inspect):** Show profiles for machine learning engineering and model operations.
- **edge (inspect):** Compare senior, staff, principal and software architect profiles for this migration.
- **blocked (inspect):** Find a profile for an unsupported specialty without pretending it is installed.
