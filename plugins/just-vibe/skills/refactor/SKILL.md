---
name: refactor
description: "Improve structure while preserving behavior"
---

# refactor

Improve structure while preserving behavior

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; structural goal, target modules, and behavior/API constraints. Requires source and a baseline verification method.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Internal organization with preserved observable behavior; feature changes are separate.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Capture relevant behavior, identify seams, transform incrementally, preserve call contracts, and compare results against the baseline.

## Deliver and verify

- Focused structural changes, rationale, compatibility evidence, and remaining debt.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Existing consumers continue to work; boundary/error behavior survives the reorganization.

## Stop and recover

- If behavior is undocumented, characterize it before changing it. Do not fold a semantic fix into the refactor without naming the scope change.

## Example request

Separate validation from persistence without changing the public API.
