---
name: react-effects
description: "Investigate effect loops, stale closures, races, and missing cleanup Use for synchronization, cleanup or dependency defects; react-state handles authoritative data placement."
---

# react-effects

Investigate effect loops, stale closures, races, and missing cleanup

## Choose this workflow

Use for synchronization, cleanup or dependency defects; react-state handles authoritative data placement.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for a reported effect bug; component, symptom, and expected synchronization.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

- **Infer from evidence:** Read component callers, ownership of state, installed React/framework versions and existing interaction tests.
- **Reasonable default:** Retain the framework and state library; preserve intended loading/error/empty behavior while resolving the named bug.
- **Ask only when needed:** Ask when product semantics such as persistence, optimistic failure or reset behavior have conflicting evidence; missing profiler access only blocks measured performance claims.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Effect dependencies, cleanup, stale closures, loops, and external synchronization.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Classify each effect as synchronization with an external system or a derived computation. Derive render-only values directly where appropriate; do not add state/effects merely to mirror existing props.
2. Trace dependency identity through setup, dependency change, cleanup and unmount. Check development replay/remount behavior against the installed framework version; cleanup must undo the resource acquired by that setup instance.
3. For async synchronization, protect current identity on both fulfillment and rejection and define ownership of any shared work. Avoid suppressing dependency checks or using a permanent once flag to hide an incorrect lifetime.
4. Verify rapid identity changes and repeated setup/cleanup with observable subscriptions, state and resource counts. Distinguish a verified lifecycle fix from a claimed performance improvement that has not been measured.
## Technical method

- **Inspect:** Identify the external system, dependency identities, setup, cleanup and reset semantics of each affected effect.
- **Method:** Move derived values to render where appropriate; make synchronization cleanup mirror setup and use supported patterns for current values.
- **Avoid misdiagnosis:** Suppressing dependency warnings conceals stale closures; aborting a request cannot undo a completed server mutation.
- **Check the result:** Exercise changed inputs, remount and unmount with controlled timers/promises and verify listeners, requests and subscriptions are released.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [React worked example](../../references/examples/react.md).
- Creating, editing or reviewing frontend UI, copy, states or visual assets: [Frontend iconography](../../references/frontend-icons.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves react testing, react race, hydration mismatch, react strictmode; load only the matching method: [React state, async and render evidence](../../references/methods/react-behavior.md).

## Decision branches

- **When old async work can complete after a new selection:** Guard stale completion as well as cleaning up; cancellation alone does not establish which response is current.

## Deliver and verify

- Effect repair and lifecycle/regression evidence.
- Effect purpose, dependency/lifecycle trace and remount/race regression checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Account changes do not show stale responses; repeated setup/cleanup does not leak subscriptions or duplicate effects.

## Stop and recover

- Do not silence dependency warnings to hide the issue. Preserve intended behavior across the framework's development checks.

## Example requests

- **Normal (apply):** Fix stale account data caused by effect request races.
- **edge (apply):** Fix an account panel where a late response from the prior account overwrites the current one.
- **blocked (inspect):** Audit effect source without reproducing browser timing; identify the required controlled race test.
