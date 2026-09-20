---
name: react-effects
description: "Investigate effect loops, stale closures, races, and missing cleanup"
---

# react-effects

Investigate effect loops, stale closures, races, and missing cleanup

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for a reported effect bug; component, symptom, and expected synchronization.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Effect dependencies, cleanup, stale closures, loops, and external synchronization.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Classify synchronization versus derived computation, inspect dependency identity, trace setup/cleanup and races, apply a minimal correction, and exercise remount/update cases.

## Deliver and verify

- Effect repair and lifecycle/regression evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Account changes do not show stale responses; repeated setup/cleanup does not leak subscriptions or duplicate effects.

## Stop and recover

- Do not silence dependency warnings to hide the issue. Preserve intended behavior across the framework's development checks.

## Example request

Fix stale account data caused by effect request races.
