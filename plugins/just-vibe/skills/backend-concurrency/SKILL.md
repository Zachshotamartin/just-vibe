---
name: backend-concurrency
description: "Investigate races, locking, and competing updates Use for violated invariants under competing operations; backend-idempotency handles repeat identity."
---

# backend-concurrency

Investigate races, locking, and competing updates

## Choose this workflow

Use for violated invariants under competing operations; backend-idempotency handles repeat identity.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; race symptom, shared resources, transaction semantics, and concurrency evidence.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Competing updates, locks, isolation, and atomicity; apply for an explicit fix.

None by default. Plan artifacts may be saved when requested.

## Execute

- Write the shared invariant and the read/decide/write interleaving that violates it. Identify every worker/process and the actual shared boundary; list durable writes, external effects and cancellation points separately.
- Choose the narrowest supported atomicity mechanism for that boundary: a conditional write, transaction, version check or shared lock. Define who starts and ends the transaction or lease; never accidentally commit or roll back a caller-owned transaction.
- Validate before irreversible work and keep related invariant checks inside the serialization boundary when their inputs can race. Handle lock acquisition failure, deadlock/serialization conflict and cancellation with bounded retries only when replay is safe.
- Force contention using separate real connections or workers and deterministic coordination. Exercise success, rejection, interruption after partial work and cleanup; assert final state and number of effects, not just the number of returned responses.

## Decision branches

- **When a caller already owns a transaction:** Follow the API contract: participate with documented savepoint semantics or reject before touching it. Do not use unconditional commit/rollback cleanup that can consume unrelated work.
- **When multiple processes share the resource:** A process-local mutex cannot establish the shared invariant. Verify at the storage or service boundary used by all writers.

## Deliver and verify

- Violating interleaving, invariant and ownership boundary, selected mechanism, retry/cleanup behavior, contention and interruption results.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Independent workers preserve the invariant under contention. Failed operations leave owned resources usable, preserve caller-owned work, and cannot return success for an uncommitted or duplicated effect.

## Stop and recover

- No live contention experiments implicitly. Do not solve local races with process-local locks when multiple processes share the resource.

## Example requests

- **Normal (inspect):** Investigate two concurrent reservations exceeding inventory capacity.
- **edge (inspect):** Prevent two concurrent reservations from selling the final available seat twice.
- **blocked (inspect):** Review concurrency logic without performing live contention experiments.
