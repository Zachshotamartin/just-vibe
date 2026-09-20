---
name: a11y
description: "Inspect and improve accessibility"
---

# a11y

Inspect and improve accessibility

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; target page/flow and accessibility concerns. Explicit remediation requests select apply mode.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Semantics, keyboard use, focus, labels, contrast, and announcements; shares checks with `ui-accessibility`.

None by default. Plan artifacts may be saved when requested.

## Execute

- Combine code inspection, automated checks where available, and manual interaction evidence; prioritize actual barriers and verify any requested fixes.

## Deliver and verify

- Reproducible findings or patch with affected users, evidence, and remaining checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Keyboard access identifies a trapped dialog; an automated pass is not presented as complete accessibility assurance.

## Stop and recover

- State which assistive technologies were actually exercised. Do not claim certification from a limited audit.

## Example request

Audit checkout keyboard navigation and error announcements.
