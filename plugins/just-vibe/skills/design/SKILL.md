---
name: design
description: "Develop a visual direction and implement the requested interface Use for a new visual direction and requested interface; polish improves an established direction and ui-system defines reusable tokens."
---

# design

Develop a visual direction and implement the requested interface

## Choose this workflow

Use for a new visual direction and requested interface; polish improves an established direction and ui-system defines reusable tokens.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for a requested interface; plan for concept-only requests. Inputs include audience, page/flow, content, references, and stack.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Requested visual direction and interface, using the existing design system where applicable.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect current UI, define hierarchy and states, implement a coherent direction, and inspect the rendered result across relevant sizes.
- Infer hierarchy from real content and user actions; reuse project primitives, choose a coherent composition and render the primary and failure states.

## Decision branches

- **When references conflict with required content or accessibility:** Explain the concrete conflict and preserve the usable content hierarchy.

## Deliver and verify

- Interface or requested concept, design rationale, and visual/interaction evidence.
- Implemented interface, visual decisions, inspected states/viewports and remaining visual gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Primary action and content hierarchy are clear; narrow screens and error states remain usable.

## Stop and recover

- Do not invent product claims or replace established branding without basis. Report unavailable visual verification.

## Example requests

- **Normal (apply):** Build the account settings page using our existing typography and controls.
- **edge (apply):** Design a dense settings page with long translations and destructive actions.
- **blocked (inspect):** Propose a direction from supplied screenshots when a browser cannot render the app.
