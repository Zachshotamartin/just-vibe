---
name: test-flaky
description: "Repair nondeterminism using repeated evidence Use for nondeterministic failures; debug first identifies the relevant failing test/environment."
---

# test-flaky

Repair nondeterminism using repeated evidence

## Choose this workflow

Use for nondeterministic failures; debug first identifies the relevant failing test/environment.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; flaky test, failure history, environment, and repetition budget.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Nondeterminism from shared state, order, time, async behavior, randomness, or environment.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Reproduce under controlled repeats/order/seeds, inspect first divergent evidence, fix isolation or synchronization, and rerun bounded stress checks.
- Record order, seed, clock and shared-resource conditions, vary one factor under a repeat cap and replace timing guesses with explicit synchronization.

## Technical method

- **Inspect:** Gather repeated outcomes, order, seed, clock, shared resources and cleanup evidence.
- **Apply:** Force the suspected race or shared-state condition deterministically before changing implementation or tests.
- **Avoid misdiagnosis:** Increasing timeouts, retries or skips can hide nondeterminism rather than repair it.
- **Check the result:** Run a bounded repeated sample with retained counts and the targeted interleaving; zero observed failures remains finite evidence.

## Decision branches

- **When no failure occurs during bounded repeats:** Report the sample and uncertainty; do not declare the flake eliminated solely from absence.

## Deliver and verify

- Cause, repair, repeat counts, failure rates, and residual uncertainty.
- Trigger conditions, isolation/synchronization fix and bounded repeat results.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The triggering interleaving/order is exercised; no failures across a stated sample is not described as mathematical proof.

## Stop and recover

- Do not hide failures with retries, sleeps, skipped tests, or inflated timeouts without evidence. Stop at the repeat budget.

## Example requests

- **Normal (apply):** Fix the test that fails only in suite order; cap diagnosis at 30 repeats.
- **edge (apply):** Repair a test that fails only after another test changes global state.
- **blocked (inspect):** Inspect flake logs without rerunning expensive suites or adding arbitrary sleeps.
