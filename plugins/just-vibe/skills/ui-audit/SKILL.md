---
name: ui-audit
description: "Inspect hierarchy, consistency, usability, and visual clarity Use to identify usability/visual issues in an existing journey; design implements a new direction."
---

# ui-audit

Inspect hierarchy, consistency, usability, and visual clarity

## Choose this workflow

Use to identify usability/visual issues in an existing journey; design implements a new direction.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; screens/flow, audience, and usability goals.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

- **Infer from evidence:** Inspect the target flow, existing components/tokens, actual renders or supplied references and current responsive behavior.
- **Reasonable default:** Reuse established visual conventions and preserve keyboard behavior; label unrendered changes as visually unverified.
- **Ask only when needed:** Ask about an unresolved interaction or visual direction only when plausible choices materially differ; do not make a missing screenshot block source inspection.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Hierarchy, consistency, content clarity, state coverage, and interaction barriers.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Inspect representative states and widths, follow the primary journey, identify concrete friction, and prioritize by user impact rather than personal taste.
2. Walk the primary and recovery journey at representative widths with realistic long/empty content; tie findings to an action the user cannot understand or complete.
## Technical method

- **Inspect:** Inspect real screens and tasks across normal, empty, error and narrow-screen states.
- **Method:** Prioritize hierarchy, discoverability and task completion using concrete observations; separate visual preference from usability failure.
- **Avoid misdiagnosis:** A screenshot cannot establish keyboard behavior, contrast in every state or successful end-to-end completion.
- **Check the result:** Revisit the same tasks and viewports after changes and cite the remaining unobserved interaction states.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [UI and frontend worked example](../../references/examples/ui.md).
- Creating, editing or reviewing frontend UI, copy, states or visual assets: [Frontend iconography](../../references/frontend-icons.md).

## Decision branches

- **When a preference has no demonstrated user impact:** Label it a design option rather than a defect.

## Deliver and verify

- Annotated findings, affected states, and targeted recommendations.
- State/viewport, user impact, evidence and prioritized correction per finding.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A confusing recovery path has a reproducible example; established brand choices are not automatically labeled defects.

## Stop and recover

- No redesign during inspection. Missing mobile/error-state evidence is identified as unreviewed rather than assumed correct.

## Example requests

- **Normal (inspect):** Audit the billing journey for hierarchy, consistency, and recoverability.
- **edge (inspect):** Audit checkout with an empty cart, payment failure and narrow viewport.
- **blocked (inspect):** Audit screenshots without interaction access; mark keyboard and dynamic states unreviewed.
