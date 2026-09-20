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

- Combine structural checks with real interaction, inspect dialogs/dynamic updates/errors, document barriers, and verify fixes using the relevant interaction method.
- Combine semantics and automated results with keyboard sequences for dialogs, forms and dynamic updates; record the exact interaction and assistive technology actually tested.

## Decision branches

- **When automated scans pass but focus or announcements fail:** Report the manual barrier and keep automated coverage separate from conformance claims.

## Deliver and verify

- Barrier report or patch with methods used and remaining checks.
- Barrier, affected interaction, reproduction, correction and verification method.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Modal focus returns to its trigger; errors are programmatically associated and usable without color alone.

## Stop and recover

- Do not claim screen-reader verification without running it. Automated scans alone cannot establish full conformance.

## Example requests

- **Normal (inspect):** Audit modal focus, keyboard dismissal, and error announcement behavior.
- **edge (inspect):** Fix modal focus return and server validation announcements without relying on color.
- **blocked (inspect):** Audit semantics without a screen reader; explicitly leave screen-reader behavior unverified.
