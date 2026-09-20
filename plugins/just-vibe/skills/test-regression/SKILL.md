---
name: test-regression
description: "Turn a confirmed bug into a lasting behavioral check Use to prevent recurrence of a confirmed defect; test adds general coverage."
---

# test-regression

Turn a confirmed bug into a lasting behavioral check

## Choose this workflow

Use to prevent recurrence of a confirmed defect; test adds general coverage.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; confirmed bug, reproduction, expected behavior, and fixed/broken revisions where available.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

A durable test protecting the actual failure mechanism.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Identify the original trigger and intended observable behavior from requirements or independent evidence. Choose the lowest layer that can faithfully exercise the boundary; a database mock cannot establish real transaction behavior.
- Construct minimal deterministic inputs and an expected result that does not call the implementation under test. Include the failing boundary and a neighboring valid case; for races, control completion order and assert that the losing path has no forbidden effect.
- Where feasible, run the unchanged test against broken and fixed behavior in an isolated copy or worktree. Preserve unrelated user edits and the real index; do not roll back a dirty working file to perform a sensitivity check.
- Confirm that the negative run fails on the intended assertion, not an import error, missing fixture, timeout or unrelated refactor. Report actual commands and statuses; if the old revision cannot run, explain the remaining evidence gap.

## Technical method

- **Inspect:** Establish the original trigger, broken revision and expected behavior independent of the proposed patch.
- **Apply:** Add the lowest-layer check that observes the real failure; verify sensitivity in an isolated broken copy when feasible.
- **Avoid misdiagnosis:** A missing import or setup timeout on the old revision does not establish regression sensitivity.
- **Check the result:** Record the causal failing assertion or valid-input exception on broken code and a pass on the fix without weakening the expectation.

## Decision branches

- **When the old revision cannot execute in this environment:** Explain the limitation and use the strongest available independent reproduction evidence.

## Deliver and verify

- Trigger and independent expected result, test layer, original-defect sensitivity, fixed and neighboring-case results, and unavailable checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The regression reaches the defective path and rejects its behavior; the fixed path and neighboring valid behavior pass. A syntax/setup failure or a test with no effective assertions is not regression evidence.

## Stop and recover

- If the old revision cannot run, state that limitation. Do not assert implementation details instead of the user-visible invariant.

## Example requests

- **Normal (apply):** Turn the confirmed duplicate-credit bug into a failing-then-passing check.
- **edge (apply):** Add regression coverage for duplicate events while allowing distinct events.
- **blocked (inspect):** Design a regression test when the original failing revision is unavailable.
