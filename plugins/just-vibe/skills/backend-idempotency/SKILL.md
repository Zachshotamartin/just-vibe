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

- Identify stable keys, define payload-conflict semantics, align deduplication with transactions/effect ownership, implement result replay, and test concurrent/reordered requests.
- Bind a key to tenant, operation and canonical payload digest; claim the key atomically and store terminal result or recoverable pending state with the effect's ownership.

## Decision branches

- **When the same key arrives with a different payload or while pending:** Return explicit conflict/pending behavior; do not execute another effect or replay an unrelated result.

## Deliver and verify

- Idempotency mechanism and duplicate/conflict/failure evidence.
- Key scope, lifecycle/retention policy and concurrent duplicate/conflicting-payload checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Concurrent repeats produce one intended effect; reusing a key for a different payload is handled explicitly.

## Stop and recover

- Do not claim exactly-once external delivery without provider support or reconciliation. Cache-only deduplication needs durability justification.

## Example requests

- **Normal (apply):** Prevent duplicate payment credits from concurrent and reordered webhooks.
- **edge (apply):** Make payment creation safe when two equal requests arrive simultaneously.
- **blocked (inspect):** Design idempotency without provider deduplication support; identify reconciliation requirements.
