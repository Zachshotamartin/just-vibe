# Testing methods

Read behavior requirements and existing test conventions. Choose the lowest layer that reliably protects the invariant: unit for isolated behavior, integration for real boundaries, end-to-end for critical journeys. Preserve the distinction between real dependency evidence and mocks.

Regression tests reproduce the actual trigger and, when feasible, fail on the broken revision before passing on the fix. Assertions target behavior, not helper call order. Fixtures use minimal realistic deterministic data, isolated identities and cleanup; never copy private production data for convenience.

Flaky tests require controlled order/seed/repetition evidence. Diagnose shared state, timing, races, environment and cleanup before changing timeouts. Record trial counts and residual uncertainty. Retries/skips do not repair a flaky invariant.

Property tests define valid generators and invariants, bound iterations, shrink failures and record seeds. Avoid filtering away difficult inputs or asserting tautologies. Load tests require exact authorized target, workload, rate/concurrency/duration caps, observability and error/resource stop thresholds. Neither a local fixture nor a staging test implies permission to stress production or trigger real payments/messages.

## Applied methods

### Layer choice

Use a unit test for a pure contract, integration test for a real boundary and end-to-end test for a critical user journey. Do not put all edge permutations in the browser when a lower layer observes the same invariant reliably. Conversely, a mocked database is not proof of real transaction or policy behavior.

### Independent assertion example

For a checkout total, calculate a small expected amount from the stated pricing rule rather than calling the same helper as the implementation. Cover null coupon and zero-valued discount separately. A regression test should fail on the actual broken path; setup failure does not demonstrate regression sensitivity. Preserve the original assertion while fixing the implementation.

When checking sensitivity, isolate the broken implementation in a temporary copy or worktree and preserve the real index and unrelated edits. Record the failing assertion or unexpected behavior exception and its causal path. A missing new helper import, parse failure in the test, or timeout before any assertion is inconclusive. An exception raised by the original implementation on a documented valid input can be the actual regression; do not require every useful test failure to have one exception class. For asynchronous tests, bound waits and release deferred resources even when an assertion fails so later checks can finish.

Test evaluators too: known-good controls should pass, seeded defects should fail, missing output and incomplete runs must not become successes. If an evaluator bug is found, retain the original scores, document the correction and rescore every affected arm under the same rule. Never silently alter a rubric for one favored result.

### Flakes and fixtures

Capture test order, seed, clock and resource identity. Force the suspected interleaving with controlled deferred work instead of arbitrary sleeps. Reproduce at a bounded repeat count and report the observed sample; zero failures does not mathematically prove absence.

Fixtures need valid defaults and intentional invalid variants, unique identities under concurrency and cleanup after partial setup. Property tests need independently stated invariants and constructive generators; reject excessive filtering and preserve shrunk counterexamples/seeds.

### Load and browser evidence

Before load generation, fix endpoint/environment, rate/concurrency/duration caps, error/load stop thresholds and side-effect isolation. Stop on thresholds and record the last stable conditions.

Browser tests should use user-visible outcomes and resilient semantic locators, inspect pending/error/recovery states and preserve useful artifacts on failure. A screenshot can establish appearance at one state; it does not establish keyboard behavior or every viewport. Unavailable dependencies remain explicit coverage gaps.

### Security review controls

For an authorization regression, assert both a forbidden cross-tenant operation with no side effects and a legitimate operation with the expected result. A fix that denies everything must fail the legitimate control. For injection, run small inert fixtures on isolated resources and verify the actual sink behavior; parser errors before the intended boundary are inconclusive. Scanner integration tests need finding, no-finding, error/timeout and partial-coverage cases. A clean scanner exit alone is not a complete oracle. The repository's security fixture suite documents its finite coverage separately from any model-review result.
