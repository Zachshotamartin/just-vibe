---
name: ui-responsive
description: "Fix layouts across screen sizes and input methods Use for layout adaptation, zoom and input differences; responsive is the same canonical workflow."
---

# ui-responsive

Fix layouts across screen sizes and input methods

## Choose this workflow

Use for layout adaptation, zoom and input differences; responsive is the same canonical workflow.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; target layouts, content extremes, and supported input/viewport conditions.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Layout adaptation including touch, pointer, zoom, and keyboard effects; shares primitives with `responsive`.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect intrinsic sizes and flow, reproduce failures, adjust layout constraints, and verify intermediate widths, long text, and relevant orientation changes.
- Find the intrinsic width constraint or overflow source, adjust layout at content-driven boundaries and test nearby widths with long text and keyboard focus.

## Decision branches

- **When hiding an element would remove required functionality:** Reflow or provide an equivalent reachable interaction instead of suppressing it.

## Deliver and verify

- Layout fixes and a viewport/input coverage record.
- Viewport/content/input matrix and observed reachability/overflow results.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Content remains reachable at narrow widths and zoom; hover-only controls have a usable alternate interaction.

## Stop and recover

- Do not hide required functionality or claim device coverage from a single desktop screenshot.

## Example requests

- **Normal (apply):** Fix the checkout layout for narrow screens, zoom, and touch input.
- **edge (apply):** Repair a table at narrow widths and high zoom without hiding essential actions.
- **blocked (inspect):** Review responsive source and screenshots without claiming real-device interaction coverage.
