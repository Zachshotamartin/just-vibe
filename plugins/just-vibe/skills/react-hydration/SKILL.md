---
name: react-hydration
description: "Diagnose server/client rendering mismatches where applicable"
---

# react-hydration

Diagnose server/client rendering mismatches where applicable

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for a reported mismatch; SSR framework, route, server/client output, and logs.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Server/client initial-render consistency and hydration behavior; applicable only to hydrated applications.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Reproduce the mismatch, compare initial values/markup, inspect time/random/browser-only sources and invalid nesting, correct the cause, and verify interactivity.

## Deliver and verify

- Hydration fix with server/client evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Initial output matches and controls work; locale/time-dependent content does not cause intermittent mismatches.

## Stop and recover

- Do not suppress warnings or disable SSR globally as a default fix. Client-only applications receive an applicability explanation.

## Example request

Fix the supplied server/client mismatch without disabling SSR globally.
