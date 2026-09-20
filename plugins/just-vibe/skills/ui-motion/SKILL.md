---
name: ui-motion
description: "Add purposeful transitions with reduced-motion behavior Use for purposeful transitions and animation behavior; polish addresses static hierarchy and spacing."
---

# ui-motion

Add purposeful transitions with reduced-motion behavior

## Choose this workflow

Use for purposeful transitions and animation behavior; polish addresses static hierarchy and spacing.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; interaction purpose, existing motion language, performance constraints, and reduced-motion requirements.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

- **Infer from evidence:** Inspect the target flow, existing components/tokens, actual renders or supplied references and current responsive behavior.
- **Reasonable default:** Reuse established visual conventions and preserve keyboard behavior; label unrendered changes as visually unverified.
- **Ask only when needed:** Ask about an unresolved interaction or visual direction only when plausible choices materially differ; do not make a missing screenshot block source inspection.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Purposeful transitions and feedback, not decorative animation across unrelated screens.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Identify what motion communicates, select minimal properties/timing, implement cancellation and reduced-motion behavior, and inspect rapid/repeated interactions.
2. Define what state change motion communicates, implement interruption/cancellation and inspect repeated input plus reduced-motion preferences.
## Technical method

- **Inspect:** Identify the change motion should explain, animation properties, interruption behavior and reduced-motion preference.
- **Method:** Keep state transitions functional without animation; favor composited properties where appropriate and cancel obsolete animations.
- **Avoid misdiagnosis:** A smooth animation can still hide focus, block input or cause discomfort; reduced motion must preserve outcome and feedback.
- **Check the result:** Interrupt/reverse transitions, test reduced motion and keyboard focus, and profile the target device interaction for jank.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [UI and frontend worked example](../../references/examples/ui.md).
- Creating, editing or reviewing frontend UI, copy, states or visual assets: [Frontend iconography](../../references/frontend-icons.md).

## Decision branches

- **When reduced motion removes information conveyed only by animation:** Supply a static equivalent while preserving action timing and feedback.

## Deliver and verify

- Motion implementation and interaction/performance checks.
- Motion/state purpose, interruption rules and normal/reduced-motion verification.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Reduced-motion users retain all information and actions; interrupted transitions do not strand the interface.

## Stop and recover

- Avoid adding a large animation dependency for trivial effects. No motion should delay an essential action or conceal loading failures.

## Example requests

- **Normal (apply):** Add restrained disclosure transitions with reduced-motion support.
- **edge (apply):** Animate a drawer that users can rapidly open and close.
- **blocked (inspect):** Review motion design without rendered timing evidence or installing an animation library.
