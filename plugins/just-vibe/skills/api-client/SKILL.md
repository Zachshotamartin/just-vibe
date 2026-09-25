---
name: api-client
description: "Build a typed client with authentication and error handling. Use for a typed transport boundary to a known API, including clients or SDKs generated from an OpenAPI spec; integrate handles wider product wiring."
---

# api-client

Build a typed client with authentication and error handling.

## Choose this workflow

Use for a typed transport boundary to a known API, including clients or SDKs generated from an OpenAPI spec; integrate handles wider product wiring.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; API specification, language/runtime, authentication source, and consumer needs.

**Pack prerequisites:** Interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

- **Infer from evidence:** Read producer/consumer schemas, error contracts, auth conventions and known supported client versions.
- **Reasonable default:** Keep compatible response and pagination semantics where the brief does not request a breaking change.
- **Ask only when needed:** Ask when contract sources disagree or an unknown consumer changes compatibility; do not require live credentials to write or test an isolated client.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Typed client boundary, serialization, errors, pagination, and permitted retries.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Resolve the API version, authentication and schema.
2. Generate or write a narrow client that isolates credentials, validates runtime response shape and preserves actionable status, retry-after and request IDs without leaking credentials.
3. Exercise controlled successful, refused, timed-out and malformed responses.

## Technical method

- **Inspect:** Inspect API version, runtime response shape, token destination, retryable operations and timeout ownership.
- **Method:** Separate transport, protocol and domain failures; validate untrusted responses where needed and restrict credential forwarding across redirects/origins.
- **Avoid misdiagnosis:** Static types disappear at runtime; automatically retrying every POST can repeat an external effect.
- **Check the result:** Exercise malformed response, cancellation, rate limit and uncertain mutation, verifying bounded retry, typed failure and no credential leakage.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [APIs worked example](../../references/examples/api.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).

## Decision branches

- **When a mutating request times out:** Retry only under a supported idempotency/reconciliation contract, not generic automatic retry.

## Deliver and verify

- Client interface with usage and configuration names, and timeout, refusal and malformed-response contract checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Valid responses decode correctly; rate limits/timeouts produce bounded behavior without duplicating unsafe requests.

## Stop and recover

- Do not embed tokens or assume generated types prove runtime validity. Live paid or mutating requests need explicit scope.

## Example requests

- **Normal (apply):** Build a typed API client with bounded retries and useful errors.
- **Edge (apply):** Build a client for paginated responses and retry-after throttling.
- **Blocked (apply):** Implement against supplied contracts without paid or mutating live requests.
