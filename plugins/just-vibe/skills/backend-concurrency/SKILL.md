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

- Model interleavings, identify violated invariants, build a deterministic concurrent scenario when authorized, choose a supported consistency mechanism, and verify contention behavior.
- Enumerate read/decide/write interleavings and enforce the invariant at the shared data boundary using supported transactions, conditional writes or locking.

## Decision branches

- **When multiple processes share the resource:** Reject process-local locks as the sole correctness mechanism and test cross-connection contention.

## Deliver and verify

- Race analysis or fix with invariant-based tests.
- Interleaving, invariant, consistency mechanism and deterministic concurrent test.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Two concurrent reservations cannot exceed capacity; retries after serialization conflict preserve intended effects.

## Stop and recover

- No live contention experiments implicitly. Do not solve local races with process-local locks when multiple processes share the resource.

## Example requests

- **Normal (inspect):** Investigate two concurrent reservations exceeding inventory capacity.
- **edge (inspect):** Prevent two concurrent reservations from selling the final available seat twice.
- **blocked (inspect):** Review concurrency logic without performing live contention experiments.
