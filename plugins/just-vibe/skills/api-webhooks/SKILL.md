---
name: api-webhooks
description: "Implement signatures, retries, replay handling, and delivery tracking"
---

# api-webhooks

Implement signatures, retries, replay handling, and delivery tracking

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

## Deliver and verify

- Webhook implementation, configuration names, and recovery/verification evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid signatures cause no business effect; retried events do not duplicate the intended effect.

## Stop and recover

- Never log signing secrets or send real business events without authorization. Provider uncertainty must be resolved before relying on delivery guarantees.

## Example request

Implement signed webhook validation and durable duplicate handling in the sandbox.
