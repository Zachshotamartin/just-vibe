---
name: react-component
description: "Build a component with its states, API, and accessibility Use to implement one component with a clear contract; ui-system defines shared primitives and tokens."
---

# react-component

Build a component with its states, API, and accessibility

## Choose this workflow

Use to implement one component with a clear contract; ui-system defines shared primitives and tokens.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; purpose, props/API, visual constraints, states, and usage context.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Reusable component plus necessary integration/example; no unrelated design-system replacement.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect existing primitives, define ownership and semantics, implement normal/loading/error/disabled states as relevant, and verify interaction and rendering.
- Define semantic HTML, controlled/uncontrolled behavior, composition slots and meaningful states before implementing the narrow public interface.

## Decision branches

- **When a component switches controlled mode after mount:** Choose a consistent ownership contract and test parent updates and reset behavior.

## Deliver and verify

- Component, documented contract, usage, and meaningful checks.
- Component API, rendered states, keyboard behavior and consumer example.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Controlled updates behave consistently; keyboard users can perform the primary interaction.

## Stop and recover

- Avoid speculative configuration options and new libraries without need. Missing design details use established conventions rather than blocking routine work.

## Example requests

- **Normal (apply):** Build an accessible controlled date-range component using existing primitives.
- **edge (apply):** Build a reusable selector supporting controlled updates and an empty option list.
- **blocked (inspect):** Specify a component using existing primitives when design assets are unavailable.
