---
name: polish
description: "Refine hierarchy, spacing, typography, and interaction details. Use for focused refinement of existing UI; design handles a larger visual direction change."
---

# polish

Refine hierarchy, spacing, typography, and interaction details.

## Choose this workflow

Use for focused refinement of existing UI; design handles a larger visual direction change.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; existing UI, target screens, and desired refinements. Requires runnable UI or supplied render evidence.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Typography, spacing, hierarchy, consistency, and interaction detail; preserve product structure and behavior.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Capture baseline renders of the target viewport and state before editing, and prioritize the visible issues.
2. Fix the dominant hierarchy, spacing or alignment issue first, at the shared token or primitive when appropriate.
3. Compare the same viewport and state after the change.

## Technical method

- **Inspect:** Inspect rendered hierarchy, spacing, typography, alignment and interaction feedback in the existing design.
- **Method:** Fix the largest visible inconsistencies while preserving established product behavior and visual intent.
- **Avoid misdiagnosis:** Arbitrary token changes can improve one screen while breaking sibling components or dense content.
- **Check the result:** Compare matched before/after states and inspect long text, narrow layout and focus/error treatments.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Creating, editing or reviewing frontend UI, copy, states or visual assets: [Frontend iconography](../../references/frontend-icons.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- Choosing states, viewports, token changes or capture conditions for visual work: [UI methods](../../references/packs/ui.md).

## Decision branches

- **When a visual change alters hit areas or focus visibility:** Recheck interaction and keyboard behavior before accepting the visual improvement.

## Deliver and verify

- Focused UI refinements with comparable before/after views and the behavior they preserve.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Refined alignment or hierarchy is visible; keyboard focus and responsive behavior are preserved.

## Stop and recover

- Do not turn a polish task into a redesign. If rendering is unavailable, distinguish code changes from visually verified results.

## Example requests

- **Normal (apply):** Improve spacing and hierarchy on billing without changing the flow.
- **Edge (apply):** Polish a form without shrinking touch targets or losing error messages.
- **Blocked (inspect):** Review screenshots only; identify refinements without claiming rendered verification.
