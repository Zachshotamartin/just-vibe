---
name: ui-states
description: "Add loading, empty, error, partial-data, disabled, and success states"
---

# ui-states

Add loading, empty, error, partial-data, disabled, and success states

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [UI and frontend methods](../../references/packs/ui.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; feature and valid loading/empty/error/partial/disabled/success conditions.

target screens/flows, existing design conventions, and runnable UI or supplied references. Visual claims require actual renders; accessibility claims distinguish automated, keyboard, and assistive-technology evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Missing state behavior and presentation for the selected feature.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Derive states from data and business rules, define transitions and recovery, implement accessible feedback, and exercise each state with controlled data.

## Deliver and verify

- State-complete UI plus transition/state verification.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Empty data is distinguished from failed loading; a retry preserves relevant user input and context.

## Stop and recover

- Do not invent payment/account policies. Unspecified critical transitions become questions while independent states proceed.

## Example request

Complete billing states for missing cards, failed renewal, and successful recovery.
