---
name: polish
description: "Refine hierarchy, spacing, typography, and interaction details"
---

# polish

Refine hierarchy, spacing, typography, and interaction details

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

## Deliver and verify

- Focused UI improvements and before/after evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Refined alignment or hierarchy is visible; keyboard focus and responsive behavior are preserved.

## Stop and recover

- Do not turn a polish task into a redesign. If rendering is unavailable, distinguish code changes from visually verified results.

## Example request

Improve spacing and hierarchy on billing without changing the flow.
