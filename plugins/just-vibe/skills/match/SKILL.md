---
name: match
description: "Compare an implementation against a visual reference and close gaps Use when a supplied visual reference is the acceptance target; design creates a direction when no exact target exists."
---

# match

Compare an implementation against a visual reference and close gaps

## Choose this workflow

Use when a supplied visual reference is the acceptance target; design creates a direction when no exact target exists.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; reference image/design, target implementation, viewport, and assets. Requires readable reference and render capability for visual proof.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Match layout, typography, imagery, and states within the given reference; no invented unseen product behavior.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Analyze reference geometry, compare an equivalent render, prioritize largest discrepancies, implement changes, and repeat bounded comparisons.
2. Match viewport, content and fonts before comparing geometry; adjust large layout discrepancies before decorative details and record legitimate responsive differences.
## Technical method

- **Inspect:** Establish reference identity, viewport, fonts, assets and the intended tolerance.
- **Method:** Compare geometry, typography, color and content in matched rendered states; prioritize structural differences before micro-adjustments.
- **Avoid misdiagnosis:** A different viewport or unloaded font can masquerade as implementation error; screenshot similarity does not prove behavior.
- **Check the result:** Retain comparable images and verify the adjusted UI still handles interaction and responsive states.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When the reference omits a required state:** Preserve established interaction behavior and label the added state as an interpretation.

## Deliver and verify

- Updated UI plus matched-state comparison and remaining differences.
- Reference conditions, matched regions, remaining differences and responsive checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Layout aligns at the reference viewport; responsive behavior is retained outside that viewport.

## Stop and recover

- Missing fonts/assets are identified explicitly. Do not call a match pixel-perfect without a controlled comparison.

## Example requests

- **Normal (apply):** Match this supplied pricing-page reference at its captured viewport.
- **edge (apply):** Match this desktop reference while retaining a usable narrow layout.
- **blocked (inspect):** Analyze a reference with unavailable brand assets; distinguish substitutes from exact matches.
