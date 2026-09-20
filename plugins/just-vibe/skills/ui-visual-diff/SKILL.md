---
name: ui-visual-diff
description: "Compare screenshots against an accepted reference"
---

# ui-visual-diff

Compare screenshots against an accepted reference

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect existing captures; reference/current renders with matching viewport, state, data, fonts, and theme.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

Declared evidence requirements: `browser.inspect`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Visual differences and regression classification; automatic fixes belong to `match` or an explicit apply request.

None by default. Plan artifacts may be saved when requested.

## Execute

- Normalize capture conditions, identify meaningful regions, separate dynamic content noise, and describe differences by user impact.

## Deliver and verify

- Compared images or annotated difference report with conditions and confidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A layout shift is detected; a timestamp-only change is not misclassified as a design regression.

## Stop and recover

- New captures require authorized browser execution. Unmatched conditions invalidate precise pixel-difference claims.

## Example request

Compare these matched-viewport screenshots and separate dynamic noise from regressions.
