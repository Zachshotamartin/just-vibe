---
name: react-async
description: "Fix loading races, cancellation, stale responses, and async behavior Use for request races, optimistic updates and async states; react-effects handles general lifecycle synchronization."
---

# react-async

Fix loading races, cancellation, stale responses, and async behavior

## Choose this workflow

Use for request races, optimistic updates and async states; react-effects handles general lifecycle synchronization.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; async interaction, request/cache layer, and observed race or loading issue.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Cancellation, response ownership, loading/error transitions, and optimistic recovery.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Trace request identity and state updates, reproduce reversed completion order, define stale-result rules, implement cleanup/recovery, and verify navigation/unmount cases.
- Assign request identity to the selected resource, control completion order in a fixture and define how optimistic state reconciles with concurrent responses.

## Decision branches

- **When cancellation arrives after the server applied a write:** Reconcile authoritative state rather than assuming the business effect was undone.

## Deliver and verify

- Async behavior repair with deterministic race tests.
- Request/state transitions, stale-result rule and reversed-completion checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An older response cannot overwrite newer selection; failed optimistic work restores a consistent state.

## Stop and recover

- Do not assume cancellation undoes server effects. Preserve the existing fetching library unless replacement is explicitly justified in scope.

## Example requests

- **Normal (apply):** Fix out-of-order search responses overwriting newer results.
- **edge (apply):** Fix search results that revert when older requests finish last.
- **blocked (inspect):** Inspect async behavior without live network access; use a controlled deferred-response fixture.
