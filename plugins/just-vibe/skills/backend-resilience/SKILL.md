---
name: backend-resilience
description: "Add appropriate timeouts, bounded retries, and failure handling Use for bounded dependency failure behavior; ops-incident handles an active incident."
---

# backend-resilience

Add appropriate timeouts, bounded retries, and failure handling

## Choose this workflow

Use for bounded dependency failure behavior; ops-incident handles an active incident.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; dependency failure modes, latency budget, retry constraints, and fallback policy.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

- **Infer from evidence:** Trace service callers, request contracts, authorization, transactions, retries and existing test infrastructure.
- **Reasonable default:** Use the existing persistence and framework; isolate local tests from live services.
- **Ask only when needed:** Resolve ambiguous durability, duplication or consistency requirements before encoding them; absent production access does not prevent local implementation.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Timeouts, bounded retries, cancellation, circuit/fallback behavior, and useful errors.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Classify retry-safe operations, allocate end-to-end time budget, implement backoff/jitter where appropriate, propagate cancellation, and simulate partial dependency failures.
2. Allocate an end-to-end deadline across attempts and dependencies, classify retry-safe effects and control exponential backoff/jitter within the total cap.
## Technical method

- **Inspect:** Inventory end-to-end deadline, nested retries, cancellation owners, concurrency limits and partial effects.
- **Method:** Budget retries with jitter and bounded attempts, propagate owned cancellation and reconcile uncertain mutations before replay.
- **Avoid misdiagnosis:** Retrying at every layer multiplies traffic; a timeout does not prove the remote operation failed.
- **Check the result:** Simulate slow dependency, transient error, permanent refusal and response loss after success; verify total deadline and effect count.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Backend worked example](../../references/examples/backend.md).


## Decision branches

- **When the deadline expires with uncertain external mutation:** Return an explicit uncertain/reconcilable state and preserve the stable operation ID.

## Deliver and verify

- Resilience changes and bounded failure/recovery tests.
- Timeout/retry/fallback matrix and controlled outage/partial-effect checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A failing dependency cannot trigger unbounded retries; non-idempotent operations are not duplicated by blind retry.

## Stop and recover

- Do not silently return stale/synthetic business results without an agreed fallback. Production fault injection requires separate authorization.

## Example requests

- **Normal (apply):** Add bounded retry and timeout behavior without duplicating unsafe requests.
- **edge (apply):** Add retries without multiplying nested dependency attempts beyond the deadline.
- **blocked (inspect):** Design resilience from contracts without injecting faults into production.
