---
name: backend-resilience
description: "Add appropriate timeouts, bounded retries, and failure handling"
---

# backend-resilience

Add appropriate timeouts, bounded retries, and failure handling

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; dependency failure modes, latency budget, retry constraints, and fallback policy.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Timeouts, bounded retries, cancellation, circuit/fallback behavior, and useful errors.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Classify retry-safe operations, allocate end-to-end time budget, implement backoff/jitter where appropriate, propagate cancellation, and simulate partial dependency failures.

## Deliver and verify

- Resilience changes and bounded failure/recovery tests.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A failing dependency cannot trigger unbounded retries; non-idempotent operations are not duplicated by blind retry.

## Stop and recover

- Do not silently return stale/synthetic business results without an agreed fallback. Production fault injection requires separate authorization.

## Example request

Add bounded retry and timeout behavior without duplicating unsafe requests.
