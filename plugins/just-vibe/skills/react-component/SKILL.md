---
name: react-component
description: "Build a component with its states, API, and accessibility"
---

# react-component

Build a component with its states, API, and accessibility

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

## Deliver and verify

- Component, documented contract, usage, and meaningful checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Controlled updates behave consistently; keyboard users can perform the primary interaction.

## Stop and recover

- Avoid speculative configuration options and new libraries without need. Missing design details use established conventions rather than blocking routine work.

## Example request

Build an accessible controlled date-range component using existing primitives.
