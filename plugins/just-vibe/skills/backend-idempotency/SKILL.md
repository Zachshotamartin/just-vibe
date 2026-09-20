---
name: backend-idempotency
description: "Prevent duplicate effects from retries and repeated requests"
---

# backend-idempotency

Prevent duplicate effects from retries and repeated requests

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

## Deliver and verify

- Idempotency mechanism and duplicate/conflict/failure evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Concurrent repeats produce one intended effect; reusing a key for a different payload is handled explicitly.

## Stop and recover

- Do not claim exactly-once external delivery without provider support or reconciliation. Cache-only deduplication needs durability justification.

## Example request

Prevent duplicate payment credits from concurrent and reordered webhooks.
