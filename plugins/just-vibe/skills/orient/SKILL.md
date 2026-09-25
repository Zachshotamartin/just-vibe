---
name: orient
description: "Identify stack, structure, conventions, and the actual commands, marked verified or discovered. Use for first contact with an unfamiliar repository; use map for dependency detail and explain for one symbol."
---

# orient

Identify stack, structure, conventions, and the actual commands, marked verified or discovered.

## Choose this workflow

Use for first contact with an unfamiliar repository; use map for dependency detail and explain for one symbol.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; repository or directory plus optional onboarding goal. Requires readable project files; runtime checks are optional.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Stack, entry points, package boundaries, instructions, and documented commands; no setup or dependency installation.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Run the bundled inspector with the selected project root. Read relevant ancestor and discovered project instructions, manifests, scripts, and representative entry points.
2. When the user names a goal, explain how it fits the actual project; otherwise summarize each package's role and entry points. List commands with their package directories; run only side-effect-free checks after reading the script body, and label every other command discovered rather than verified.

## Technical method

- **Inspect:** Inspect bounded manifests, entry points, scripts, workspace layout and applicable project instructions.
- **Method:** Distinguish declared stack from observed runnable commands; follow a representative entry point to its owner.
- **Avoid misdiagnosis:** A package script's name does not prove it works, and importing configuration can execute code during inspection.
- **Check the result:** Cite the source of stack/build claims and identify commands actually executed versus merely discovered.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When multiple packages or stale documentation:** Identify each package's role and distinguish configured commands from commands actually exercised.

## Deliver and verify

- Project orientation with file links, conventions and unknowns, plus an entry-point table (path, role, caller, verification command, unresolved assumption) that labels each command discovered or verified.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A monorepo yields package-specific commands; stale README instructions are identified rather than repeated as working.

## Stop and recover

- Unreadable roots or ambiguous projects produce a targeted blocker; never claim the application runs without evidence.

## Example requests

- **Normal (inspect):** Help me find how checkout works and which checks cover it.
- **Edge (inspect):** Orient this monorepo; the README describes an app that was removed.
- **Blocked (inspect):** Inspect this source archive without Git history or executing scripts.
