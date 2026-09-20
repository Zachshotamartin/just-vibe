---
name: ui-audit
description: "Inspect hierarchy, consistency, usability, and visual clarity"
---

# ui-audit

Inspect hierarchy, consistency, usability, and visual clarity

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; screens/flow, audience, and usability goals.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Hierarchy, consistency, content clarity, state coverage, and interaction barriers.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect representative states and widths, follow the primary journey, identify concrete friction, and prioritize by user impact rather than personal taste.

## Deliver and verify

- Annotated findings, affected states, and targeted recommendations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A confusing recovery path has a reproducible example; established brand choices are not automatically labeled defects.

## Stop and recover

- No redesign during inspection. Missing mobile/error-state evidence is identified as unreviewed rather than assumed correct.

## Example request

Audit the billing journey for hierarchy, consistency, and recoverability.
