---
name: skill
description: "Create or improve a workflow skill Use to author or revise a reusable workflow; ordinary one-off work should not create a new skill."
---

# skill

Create or improve a workflow skill

## Choose this workflow

Use to author or revise a reusable workflow; ordinary one-off work should not create a new skill.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; workflow purpose, activation conditions, target host, and examples.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Create/update a skill and necessary supporting utilities; installation/publication is separate unless requested.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect existing skills, define boundaries and inputs, write actionable instructions, separate repeatable execution into utilities, and validate triggering plus behavior fixtures.
- Define a matching and a near-miss request, reuse established packaging conventions, and move conditional detail into references only when needed.

## Decision branches

- **When guidance merely repeats generic model capabilities:** Remove it and retain decisions, invariants and examples that change behavior.

## Deliver and verify

- Skill files, capability requirements, usage examples, and validation evidence.
- Skill entry point, supporting assets, matching boundaries and independent fixture evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A matching request triggers the intended behavior; a nearby out-of-scope request does not acquire unrelated instructions.

## Stop and recover

- Do not create universal catch-all skills, silently enable hooks, or claim executable guarantees from prose alone.

## Example requests

- **Normal (apply):** Create a focused workflow for reviewing database migrations in this project.
- **edge (apply):** Create a skill whose name overlaps an existing deployment workflow.
- **blocked (inspect):** Review a proposed skill without host installation access or claiming it is enabled.
