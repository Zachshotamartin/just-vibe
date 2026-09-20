# Testing methods

Read behavior requirements and existing test conventions. Choose the lowest layer that reliably protects the invariant: unit for isolated behavior, integration for real boundaries, end-to-end for critical journeys. Preserve the distinction between real dependency evidence and mocks.

Regression tests reproduce the actual trigger and, when feasible, fail on the broken revision before passing on the fix. Assertions target behavior, not helper call order. Fixtures use minimal realistic deterministic data, isolated identities and cleanup; never copy private production data for convenience.

Flaky tests require controlled order/seed/repetition evidence. Diagnose shared state, timing, races, environment and cleanup before changing timeouts. Record trial counts and residual uncertainty. Retries/skips do not repair a flaky invariant.

Property tests define valid generators and invariants, bound iterations, shrink failures and record seeds. Avoid filtering away difficult inputs or asserting tautologies. Load tests require exact authorized target, workload, rate/concurrency/duration caps, observability and error/resource stop thresholds. Neither a local fixture nor a staging test implies permission to stress production or trigger real payments/messages.
