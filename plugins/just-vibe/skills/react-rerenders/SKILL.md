---
name: react-rerenders
description: "Measure unnecessary rendering and identify its causes"
---

# react-rerenders

Measure unnecessary rendering and identify its causes

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; slow interaction, component scope, and profiler traces. Explicit profiling/fix requests authorize bounded execution/apply.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `browser.inspect`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Unnecessary rendering, expensive render work, and state propagation.

None by default. Plan artifacts may be saved when requested.

## Execute

- Establish the interaction baseline, inspect profiler commits, trace changing props/context/identities, fix the measured cause when requested, and compare behavior and timing.

## Deliver and verify

- Render-cause analysis or patch with comparable evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The slow interaction improves measurably; memoization does not preserve stale data or break callbacks.

## Stop and recover

- Avoid blanket memoization and equating render count with user-visible cost. Missing profiles yield hypotheses only.

## Example request

Analyze why changing a filter rerenders the full product grid using this profile.
