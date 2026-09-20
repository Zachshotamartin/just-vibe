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

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Correct the demonstrated cause and nearby necessary behavior; no broad cleanup.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Read the behavior contract, nearby callers and existing checks before inferring expected behavior from the defective implementation. Separate the reproduced trigger, intended result and compatibility requirements; record conflicting evidence instead of choosing whichever makes the patch easiest.
2. Trace the failing input through validation, state transitions and the observable result. Choose a focused change that corrects the cause and preserves neighboring valid behavior; distinguish missing, null, zero, false and empty values where the contract does.
3. Reproduce the original failure, apply the fix and run relevant checks with actual exit statuses. Where a regression test is warranted, derive its expected result independently from the contract and establish that it detects the defect rather than incidental setup failure.
## Technical method

- **Inspect:** Establish actual versus expected behavior, reproducible trigger and first causal divergence.
- **Method:** Create a discriminating regression, repair the owning boundary and check adjacent legitimate behavior.
- **Avoid misdiagnosis:** Editing the last visible exception or weakening the assertion can hide the root defect.
- **Check the result:** Demonstrate the original failure in isolation where feasible and verify the fix without relying on unrelated worktree changes.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).

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
