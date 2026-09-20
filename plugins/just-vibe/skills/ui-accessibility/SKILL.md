---
name: ui-accessibility
description: "Inspect semantics, keyboard access, focus, contrast, and announcements"
---

# ui-accessibility

Inspect semantics, keyboard access, focus, contrast, and announcements

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

## Deliver and verify

- Barrier report or patch with methods used and remaining checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Modal focus returns to its trigger; errors are programmatically associated and usable without color alone.

## Stop and recover

- Do not claim screen-reader verification without running it. Automated scans alone cannot establish full conformance.

## Example request

Audit modal focus, keyboard dismissal, and error announcement behavior.
