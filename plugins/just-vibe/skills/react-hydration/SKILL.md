---
name: react-hydration
description: "Diagnose server/client rendering mismatches where applicable Use for SSR/first-client mismatches; client-only rendering does not need hydration repair."
---

# react-hydration

Diagnose server/client rendering mismatches where applicable

## Choose this workflow

Use for SSR/first-client mismatches; client-only rendering does not need hydration repair.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for a reported mismatch; SSR framework, route, server/client output, and logs.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Server/client initial-render consistency and hydration behavior; applicable only to hydrated applications.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Reproduce the exact route and compare server markup with the first client render. Trace request-specific state, timestamps, locale, random values, browser-only APIs and invalid HTML nesting; distinguish parser repair from state mismatch.
- Choose a stable initial contract and move browser-only transitions to the appropriate lifecycle. Ensure request-specific state is isolated across server requests; do not silence hydration warnings or disable rendering broadly to conceal the cause.
- Verify direct server navigation and client navigation under differing locale/timezone and repeated requests where relevant. Confirm the page becomes interactive and retains its intended initial content, not merely that warnings disappeared.

## Decision branches

- **When mismatch depends on user-specific data unavailable to the server:** Define a consistent initial snapshot or intentional client-only boundary for that region.

## Deliver and verify

- Hydration fix with server/client evidence.
- Mismatch source, initial-state contract and hydration plus interactivity checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Server and initial client output agree for the supported contract; interactivity and request isolation survive the repair. Suppressed warnings do not count as evidence.

## Stop and recover

- Do not suppress warnings or disable SSR globally as a default fix. Client-only applications receive an applicability explanation.

## Example requests

- **Normal (apply):** Fix the supplied server/client mismatch without disabling SSR globally.
- **edge (apply):** Fix a clock and persisted theme that render differently on the server.
- **blocked (inspect):** Diagnose supplied server/client markup without claiming a browser hydration run.
