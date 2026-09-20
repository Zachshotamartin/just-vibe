---
name: coverage
description: "Identify important untested behaviors and prioritize them Use to prioritize missing behavioral checks; test implements the selected cases."
---

# coverage

Identify important untested behaviors and prioritize them

## Choose this workflow

Use to prioritize missing behavioral checks; test implements the selected cases.

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
- Trace important failure and recovery paths to actual assertions; look for tests that pass when the requirement is deliberately violated.

## Technical method

- **Inspect:** Map requirements and failure modes to existing tests and observed execution.
- **Apply:** Prioritize unprotected invariants and boundary cases over raw line percentage.
- **Avoid misdiagnosis:** Executed lines do not establish meaningful assertions; mocks can leave the real boundary untested.
- **Check the result:** Demonstrate an important plausible defect that escapes current checks and specify the smallest test that would catch it.

## Decision branches

- **When line coverage is high but assertions ignore the effect:** Prioritize the missing invariant over increasing the percentage.

## Deliver and verify

- Prioritized test opportunities with suggested layer, setup, and expected assertion.
- Ranked gap table with consequence, setup, layer and expected assertion.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Untested recovery behavior is identified despite high line coverage; a low-risk uncovered getter is not prioritized over access control.

## Stop and recover

- Distinguish measured coverage from inferred coverage. Running new coverage jobs requires execution authorization.

## Example requests

- **Normal (inspect):** Identify the highest-risk untested billing behaviors from existing tests.
- **edge (inspect):** Audit coverage of failed checkout retries despite 95 percent line coverage.
- **blocked (inspect):** Inspect test sources without a coverage report; avoid claiming measured percentages.
