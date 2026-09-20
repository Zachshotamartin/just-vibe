---
name: orient
description: "Identify stack, structure, conventions, and actual working commands"
---

# orient

Identify stack, structure, conventions, and actual working commands

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository or directory plus optional onboarding goal. Requires readable project files; runtime checks are optional.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Stack, entry points, package boundaries, instructions, and documented commands; no setup or dependency installation.

None by default. Plan artifacts may be saved when requested.

## Execute

1. Run the bundled inspector with the selected project root. Read relevant ancestor and discovered project instructions, manifests, scripts, and representative entry points.
2. Explain how the requested feature fits the actual project, list commands with their package directories, and distinguish discovered commands from checks you actually ran.

Task-specific method: Inspect manifests and scripts, sample representative modules, reconcile documentation with code, and identify the shortest path to the user's goal. Label unexecuted commands as inferred.

## Deliver and verify

- Project orientation with file links, likely run/check commands, conventions, and unknowns.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A monorepo yields package-specific commands; stale README instructions are identified rather than repeated as working.

## Stop and recover

- Unreadable roots or ambiguous projects produce a targeted blocker; never claim the application runs without evidence.

## Example request

Help me find how checkout works and which checks cover it.
