---
name: api-client
description: "Build a typed client with authentication and error handling"
---

# api-client

Build a typed client with authentication and error handling

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

## Deliver and verify

- Client, usage/configuration documentation, and contract checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Valid responses decode correctly; rate limits/timeouts produce bounded behavior without duplicating unsafe requests.

## Stop and recover

- Do not embed tokens or assume generated types prove runtime validity. Live paid or mutating requests need explicit scope.

## Example request

Build a typed API client with bounded retries and useful errors.
