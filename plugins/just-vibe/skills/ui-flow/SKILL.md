---
name: ui-flow
description: "Improve a complete user journey, including error recovery"
---

# ui-flow

Improve a complete user journey, including error recovery

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; user goal, entry/exit points, current flow, and success constraints.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

One complete journey including cancellation, errors, navigation, and recovery.

None by default. Plan artifacts may be saved when requested.

## Execute

- Walk the journey, map decisions and state transitions, identify dead ends/friction, propose improvements, and implement only when requested.

## Deliver and verify

- Flow map, prioritized changes, and journey acceptance scenarios.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Users can recover from a mid-flow failure; back navigation does not silently discard required state.

## Stop and recover

- Do not simplify by removing necessary policy or consent steps. Distinguish observed usability issues from assumptions needing user testing.

## Example request

Plan improving account recovery, including expired links and back navigation.
