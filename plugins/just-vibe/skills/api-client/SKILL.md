---
name: api-client
description: "Build a typed client with authentication and error handling Use for a typed transport boundary to a known API; integrate handles wider product wiring."
---

# api-client

Build a typed client with authentication and error handling

## Choose this workflow

Use for a typed transport boundary to a known API; integrate handles wider product wiring.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; API specification, language/runtime, authentication source, and consumer needs.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Typed client boundary, serialization, errors, pagination, and permitted retries.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Verify contract/version, generate or write a narrow client, isolate credentials, preserve useful errors, and exercise controlled successful and failed responses.
- Resolve version/auth/schema, validate runtime response shape and preserve actionable status, retry-after and request IDs without leaking credentials.

## Decision branches

- **When a mutating request times out:** Retry only under a supported idempotency/reconciliation contract, not generic automatic retry.

## Deliver and verify

- Client, usage/configuration documentation, and contract checks.
- Client interface, configuration names and timeout/refusal/malformed-response checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Valid responses decode correctly; rate limits/timeouts produce bounded behavior without duplicating unsafe requests.

## Stop and recover

- Do not embed tokens or assume generated types prove runtime validity. Live paid or mutating requests need explicit scope.

## Example requests

- **Normal (apply):** Build a typed API client with bounded retries and useful errors.
- **edge (apply):** Build a client for paginated responses and retry-after throttling.
- **blocked (inspect):** Implement against supplied contracts without paid or mutating live requests.
