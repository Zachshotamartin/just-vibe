---
name: coverage
description: "Identify important untested behaviors and prioritize them"
---

# coverage

Identify important untested behaviors and prioritize them

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; subsystem/change and existing test or coverage evidence.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Important missing behavioral coverage; no automatic test generation or percentage chasing.

None by default. Plan artifacts may be saved when requested.

## Execute

- Map requirements and failure paths to tests, inspect assertions rather than names, and rank gaps by consequence and likelihood.

## Deliver and verify

- Prioritized test opportunities with suggested layer, setup, and expected assertion.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Untested recovery behavior is identified despite high line coverage; a low-risk uncovered getter is not prioritized over access control.

## Stop and recover

- Distinguish measured coverage from inferred coverage. Running new coverage jobs requires execution authorization.

## Example request

Identify the highest-risk untested billing behaviors from existing tests.
