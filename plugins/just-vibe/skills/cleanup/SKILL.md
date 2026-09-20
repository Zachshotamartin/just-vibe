---
name: cleanup
description: "Remove verified dead code and unnecessary complexity Use for evidence-backed removal of unnecessary code or assets; refactor preserves behavior through restructuring."
---

# cleanup

Remove verified dead code and unnecessary complexity

## Choose this workflow

Use for evidence-backed removal of unnecessary code or assets; refactor preserves behavior through restructuring.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; directory/change scope and cleanup objective. Requires references, build configuration, and relevant checks.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Demonstrably unused code, stale artifacts, or needless complexity; no behavior redesign.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Find candidates, check dynamic/configuration references and public exports, remove only supported candidates, and verify affected builds/behavior.
2. Check static callers, public exports, framework conventions and runtime registration; remove a coherent candidate set with a restorable diff.
## Technical method

- **Inspect:** Locate apparently unused code/assets and inspect static, dynamic, generated and externally documented consumers.
- **Method:** Remove only verified dead paths in coherent groups and update references/generated outputs from their source.
- **Avoid misdiagnosis:** Static search can miss reflection, routing conventions, plugins or public consumers.
- **Check the result:** Run relevant build/behavior checks and preserve uncertain external API uses rather than deleting them on absence of local references.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When use cannot be excluded because loading is dynamic:** Retain the candidate and name the missing runtime or configuration evidence.

## Deliver and verify

- Focused deletions/simplifications with evidence of non-use and checks.
- Removed items with non-use evidence and checks for affected consumers.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Verified dead code is removed; a dynamically loaded module survives despite lacking static imports.

## Stop and recover

- Uncertain candidates remain with an explanation. Never delete user data or untracked files merely because they look temporary.

## Example requests

- **Normal (apply):** Remove demonstrably unused checkout helpers; preserve public exports.
- **edge (apply):** Clean dead files while preserving route files discovered by filename.
- **blocked (inspect):** Identify cleanup candidates without build access; leave uncertain dynamic modules intact.
