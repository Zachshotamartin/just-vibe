---
name: api-webhooks
description: "Implement signatures, retries, replay handling, and delivery tracking Use for authenticated durable event receipt; backend-jobs handles deferred processing."
---

# api-webhooks

Implement signatures, retries, replay handling, and delivery tracking

## Choose this workflow

Use for authenticated durable event receipt; backend-jobs handles deferred processing.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; inbound/outbound direction, provider contract, signing method, events, and environment.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Verification, delivery/retry, replay handling, event ordering, and tracking for the specified integration.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Validate signatures against correct raw bytes, separate receipt from processing, implement durable deduplication, and test invalid, duplicate, delayed, and reordered messages.
- Verify signatures using provider-specified raw bytes and time rules, persist receipt identity before acknowledgment and separate deduplication from business processing.

## Technical method

- **Inspect:** Read the provider's signature contract, raw-body handling, timestamp tolerance, event IDs and retry/order semantics.
- **Apply:** Verify authentic bytes before side effects, durably deduplicate delivery and business effects, and handle out-of-order versions deliberately.
- **Avoid misdiagnosis:** Re-serialized JSON changes signed bytes; a valid signature does not prevent replay or duplicate processing.
- **Check the result:** Test altered body, invalid/stale signature, concurrent duplicate, reversed event order and a crash before acknowledgment with synthetic fixtures.

## Read when relevant

- Identity, ownership, tenant isolation, replay or privilege changes affect the task: [Identity and authorization](../../references/security/identity.md).

## Decision branches

- **When valid events arrive out of order or concurrently:** Apply version/ordering policy and durable effect deduplication rather than assuming arrival order.

## Deliver and verify

- Webhook implementation, configuration names, and recovery/verification evidence.
- Receipt/processing state machine and invalid, replayed, duplicate and reordered checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid signatures cause no business effect; retried events do not duplicate the intended effect.

## Stop and recover

- Never log signing secrets or send real business events without authorization. Provider uncertainty must be resolved before relying on delivery guarantees.

## Example requests

- **Normal (apply):** Implement signed webhook validation and durable duplicate handling in the sandbox.
- **edge (apply):** Handle two concurrent copies of a signed payment event.
- **blocked (inspect):** Review webhook handling without live signing keys or sending real business events.
