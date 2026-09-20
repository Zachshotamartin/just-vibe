---
name: react-async
description: "Fix loading races, cancellation, stale responses, and async behavior"
---

# react-async

Fix loading races, cancellation, stale responses, and async behavior

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

## Deliver and verify

- Async behavior repair with deterministic race tests.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An older response cannot overwrite newer selection; failed optimistic work restores a consistent state.

## Stop and recover

- Do not assume cancellation undoes server effects. Preserve the existing fetching library unless replacement is explicitly justified in scope.

## Example request

Fix out-of-order search responses overwriting newer results.
