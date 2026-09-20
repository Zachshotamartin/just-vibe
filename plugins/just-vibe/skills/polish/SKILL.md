---
name: polish
description: "Refine hierarchy, spacing, typography, and interaction details Use for focused refinement of existing UI; design handles a larger visual direction change."
---

# polish

Refine hierarchy, spacing, typography, and interaction details

## Choose this workflow

Use for focused refinement of existing UI; design handles a larger visual direction change.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; existing UI, target screens, and desired refinements. Requires runnable UI or supplied render evidence.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Typography, spacing, hierarchy, consistency, and interaction detail; preserve product structure and behavior.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect baseline renders, prioritize visible issues, adjust shared tokens/components where appropriate, and compare the same states after changes.
- Capture the same viewport/state before editing; fix the dominant hierarchy, spacing or alignment issue at the shared primitive when appropriate.

## Technical method

- **Inspect:** Inspect rendered hierarchy, spacing, typography, alignment and interaction feedback in the existing design.
- **Apply:** Fix the largest visible inconsistencies while preserving established product behavior and visual intent.
- **Avoid misdiagnosis:** Arbitrary token changes can improve one screen while breaking sibling components or dense content.
- **Check the result:** Compare matched before/after states and inspect long text, narrow layout and focus/error treatments.

## Decision branches

- **When a visual change alters hit areas or focus visibility:** Recheck interaction and keyboard behavior before accepting the visual improvement.

## Deliver and verify

- Focused UI improvements and before/after evidence.
- Comparable before/after views and the behavior preserved by the refinement.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Refined alignment or hierarchy is visible; keyboard focus and responsive behavior are preserved.

## Stop and recover

- Do not turn a polish task into a redesign. If rendering is unavailable, distinguish code changes from visually verified results.

## Example requests

- **Normal (apply):** Improve spacing and hierarchy on billing without changing the flow.
- **edge (apply):** Polish a form without shrinking touch targets or losing error messages.
- **blocked (inspect):** Review screenshots only; identify refinements without claiming rendered verification.
