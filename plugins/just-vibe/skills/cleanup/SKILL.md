---
name: cleanup
description: "Remove verified dead code and unnecessary complexity"
---

# cleanup

Remove verified dead code and unnecessary complexity

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; directory/change scope and cleanup objective. Requires references, build configuration, and relevant checks.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Demonstrably unused code, stale artifacts, or needless complexity; no behavior redesign.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Find candidates, check dynamic/configuration references and public exports, remove only supported candidates, and verify affected builds/behavior.

## Deliver and verify

- Focused deletions/simplifications with evidence of non-use and checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Verified dead code is removed; a dynamically loaded module survives despite lacking static imports.

## Stop and recover

- Uncertain candidates remain with an explanation. Never delete user data or untracked files merely because they look temporary.

## Example request

Remove demonstrably unused checkout helpers; preserve public exports.
