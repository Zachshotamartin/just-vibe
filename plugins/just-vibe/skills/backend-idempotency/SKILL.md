---
name: backend-idempotency
description: "Prevent duplicate effects from retries and repeated requests Use to make repeated operations produce the intended single effect; backend-concurrency covers broader interleavings."
---

# backend-idempotency

Prevent duplicate effects from retries and repeated requests

## Choose this workflow

Use to make repeated operations produce the intended single effect; backend-concurrency covers broader interleavings.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; retried operation, effect boundary, request identity, and deduplication lifetime.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Prevent duplicate effects for the specified operation, including concurrent duplicates.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Define the business operation, key namespace, payload equivalence, validity/retention window and replay response. Include tenant and operation where they distinguish effects; specify how equal keys with different payloads or pending work are handled.
- Validate the payload without permissive coercion where the contract requires exact types or bounds. Check ownership, funds/capacity and numeric limits at the boundary that protects against concurrent change.
- When the effect and deduplication record share a database, make their success/failure atomic using the engine-supported transaction and uniqueness mechanism. Define transaction ownership and make identical concurrent requests converge on the original stored result.
- For an external effect, walk the crash before send, timeout after possible success and failure before local recording. Use supported provider idempotency or durable reconciliation; a local key alone cannot prove exactly-once external execution.
- Test equal replay, conflicting payload, separate tenants, simultaneous claims and failure after each durable step. Assert state, stored result and hook/provider call count; verify a retry after rollback can succeed without repeating a completed effect.

## Technical method

- **Inspect:** Identify key scope, normalized payload, unique storage constraint, external provider support and retention.
- **Apply:** Atomically bind a key to payload and result; distinguish completed, in-progress and uncertain external outcomes with reconciliation.
- **Avoid misdiagnosis:** An in-memory map fails across processes; deleting a pending key after a timeout can permit a second charge.
- **Check the result:** Send concurrent equal requests and same-key different-payload requests, then interrupt after external success before local recording.

## Decision branches

- **When the same key arrives with a different payload or while pending:** Return explicit conflict/pending behavior; do not execute another effect or replay an unrelated result.

## Deliver and verify

- Operation/key/payload contract, durable ownership and retention policy, failure-window table, and replay/conflict/concurrency/interruption evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Equal replay performs no new effect; a conflicting payload cannot inherit an unrelated result. Local rollback removes both partial effects and the claim when the contract permits retry; uncertain external outcomes remain explicitly unresolved.

## Stop and recover

- Do not claim exactly-once external delivery without provider support or reconciliation. Cache-only deduplication needs durability justification.

## Example requests

- **Normal (apply):** Prevent duplicate payment credits from concurrent and reordered webhooks.
- **edge (apply):** Make payment creation safe when two equal requests arrive simultaneously.
- **blocked (inspect):** Design idempotency without provider deduplication support; identify reconciliation requirements.
