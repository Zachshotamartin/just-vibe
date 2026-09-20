---
name: react-state
description: "Simplify state ownership, derived state, and synchronization"
---

# react-state

Simplify state ownership, derived state, and synchronization

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan for redesign; apply for explicit state refactoring. Requires component flow and ownership constraints.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

State location, derived values, synchronization, and transitions within the feature.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify authoritative values, remove redundant representations when safe, define transitions, choose the narrowest owner, and verify user-visible behavior.

## Deliver and verify

- State model and proposed or implemented simplification with tests.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Editing and resetting remain consistent; independent component instances do not accidentally share local state.

## Stop and recover

- Do not introduce a global store by default. Undefined persistence or cross-tab requirements are explicit design questions.

## Example request

Plan simplifying duplicated filter state without adding a state library.
