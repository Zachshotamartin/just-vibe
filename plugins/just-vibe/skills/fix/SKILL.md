---
name: fix
description: "Reproduce a bug, identify its cause, and verify the fix Use when the requested outcome is correcting a demonstrated defect; debug diagnoses without default edits."
---

# fix

Reproduce a bug, identify its cause, and verify the fix

## Choose this workflow

Use when the requested outcome is correcting a demonstrated defect; debug diagnoses without default edits.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; symptom, expected behavior, and reproduction context. Requires source and a reproducible case or reliable failure evidence.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Correct the demonstrated cause and nearby necessary behavior; no broad cleanup.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Read the behavior contract, nearby callers and existing checks before inferring expected behavior from the defective implementation. Separate the reproduced trigger, intended result and compatibility requirements; record conflicting evidence instead of choosing whichever makes the patch easiest.
- Trace the failing input through validation, state transitions and the observable result. Choose a focused change that corrects the cause and preserves neighboring valid behavior; distinguish missing, null, zero, false and empty values where the contract does.
- Reproduce the original failure, apply the fix and run relevant checks with actual exit statuses. Where a regression test is warranted, derive its expected result independently from the contract and establish that it detects the defect rather than incidental setup failure.

## Decision branches

- **When the written contract disagrees with the current fallback or coercion:** Treat the discrepancy as part of the bug investigation. Check callers and compatibility evidence; do not encode the old fallback into a new test merely because it already exists.
- **When failure cannot be reproduced:** Compare environments and choose a discriminating experiment. Label an unverified patch as partial and state which observation would establish the result.

## Deliver and verify

- Trigger, contract evidence, causal location, focused patch, actual before/after checks and remaining uncertainty.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The original failure no longer occurs; a neighboring valid case stays correct.

## Stop and recover

- If reproduction is unavailable, label hypotheses and investigate without presenting a speculative patch as a verified fix.

## Example requests

- **Normal (apply):** An expired discount crashes checkout. Reproduce and preserve the error format.
- **edge (apply):** Fix a null-input crash without changing the behavior of a zero-value input.
- **blocked (inspect):** Diagnose an intermittent crash with no reproduction; do not claim a verified repair.
