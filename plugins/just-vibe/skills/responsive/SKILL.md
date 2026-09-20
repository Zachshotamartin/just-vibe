---
name: responsive
description: "Diagnose and fix layouts across screen sizes"
---

# responsive

Diagnose and fix layouts across screen sizes

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; page/components, affected viewport/input method, and screenshots if available.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Adapt existing UI across relevant sizes; shares layout checks with `ui-responsive`.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Reproduce overflow or compression, inspect intrinsic sizing and breakpoints, fix layout constraints, and inspect neighboring widths and content lengths.

## Deliver and verify

- Responsive patch and viewport/state verification matrix.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Reported overflow disappears; long text and touch targets remain usable at narrow widths.

## Stop and recover

- Do not hide essential content to make a screenshot fit. Report untested device-specific behavior separately.

## Example request

Fix horizontal overflow on the product page at narrow widths.
