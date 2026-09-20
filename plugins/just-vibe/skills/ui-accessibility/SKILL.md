---
name: ui-accessibility
description: "Inspect semantics, keyboard access, focus, contrast, and announcements Use for accessibility audit or requested remediation; a11y is the same canonical workflow."
---

# ui-accessibility

Inspect semantics, keyboard access, focus, contrast, and announcements

## Choose this workflow

Use for accessibility audit or requested remediation; a11y is the same canonical workflow.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; component/flow and target accessibility concerns. Apply for requested remediation.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Semantic roles, labels, focus sequence, keyboard interactions, contrast, and announcements.

None by default. Plan artifacts may be saved when requested.

## Execute

- Choose the actual task/route and interaction states: initial, loading, empty, error, open/closed and recovery where relevant. Inspect semantics, accessible names, relationships and contrast alongside the visible design.
- Execute the keyboard path and record focus at each transition. For dialogs test entry, containment where appropriate, escape/close and return to the initiating control; if that control disappears, define a sensible surviving destination.
- Exercise form errors and dynamic updates using the relevant interaction method. Check programmatic error association and announcements without relying on color or duplicate noisy live regions.
- Use automated scanning as one evidence source, then verify corrected barriers with the actual keyboard or assistive technology tested. State browser/device/AT and uncovered states; an automated pass is not a blanket conformance claim.

## Technical method

- **Inspect:** Inspect native semantics, accessible name/description, focus sequence, contrast and live updates.
- **Apply:** Use native controls first; apply matching APG interaction patterns for custom widgets and test behavior as well as attributes.
- **Avoid misdiagnosis:** Passing an automated checker does not prove keyboard or screen-reader usability; positive tabindex creates fragile ordering.
- **Check the result:** Complete the main flow using only keyboard, inspect focus visibility/return and announced errors, and report assistive-tech coverage actually exercised.

## Decision branches

- **When automated scans pass but focus or announcements fail:** Report the manual barrier and keep automated coverage separate from conformance claims.

## Deliver and verify

- Barrier and affected task/state, exact reproduction, correction, actual browser/input/AT evidence and remaining coverage gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Modal focus returns to its trigger; errors are programmatically associated and usable without color alone.

## Stop and recover

- Do not claim screen-reader verification without running it. Automated scans alone cannot establish full conformance.

## Example requests

- **Normal (inspect):** Audit modal focus, keyboard dismissal, and error announcement behavior.
- **edge (inspect):** Fix modal focus return and server validation announcements without relying on color.
- **blocked (inspect):** Audit semantics without a screen reader; explicitly leave screen-reader behavior unverified.
