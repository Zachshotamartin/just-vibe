---
name: react-audit
description: "Review components, hooks, state ownership, and behavioral risks Use for React correctness inspection; react-rerenders requires performance evidence and react-effects targets synchronization."
---

# react-audit

Review components, hooks, state ownership, and behavioral risks

## Choose this workflow

Use for React correctness inspection; react-rerenders requires performance evidence and react-effects targets synchronization.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [React methods](../../references/packs/react.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; component tree/feature and behavioral concerns.

component source, React/framework versions, state/data conventions, and relevant test tooling. Browser/profiler evidence is needed for measured rendering claims. Preserve existing framework and state libraries unless changing them is part of the request.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Hooks, ownership, identity, effects, async boundaries, and component contracts.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace props/state and lifecycle, identify reachable failure paths, inspect tests and framework constraints, and rank concrete risks.
- Identify React/framework version and server/client boundary, then trace state ownership, hook order, key identity and reachable interaction states.

## Decision branches

- **When source suggests excess rendering without a profile:** Report a performance hypothesis separately from demonstrated correctness defects.

## Deliver and verify

- Findings with component locations, triggers, and repair suggestions.
- Finding location, triggering interaction, state transition and severity rationale.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A conditional hook or unstable key problem includes its trigger; a stylistic preference is not presented as a correctness bug.

## Stop and recover

- Do not rewrite components during an audit or infer runtime rendering cost solely from source size.

## Example requests

- **Normal (inspect):** Audit checkout hooks and state ownership for reachable behavioral bugs.
- **edge (inspect):** Audit a reordered editable list and a component with an early return before a hook.
- **blocked (inspect):** Review React source without a browser; mark interaction behavior unverified.
