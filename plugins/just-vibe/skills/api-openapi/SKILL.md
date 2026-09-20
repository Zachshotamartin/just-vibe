---
name: api-openapi
description: "Create or reconcile OpenAPI documentation with implementation Use to maintain an OpenAPI contract; api-breaking assesses compatibility between versions."
---

# api-openapi

Create or reconcile OpenAPI documentation with implementation

## Choose this workflow

Use to maintain an OpenAPI contract; api-breaking assesses compatibility between versions.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; existing OpenAPI/schema, implementation, and source-of-truth convention.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Reconcile documented paths, schemas, authentication, responses, and examples with actual intended behavior.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect routes and serializers, compare schema coverage, resolve documentation-versus-code discrepancies, update the correct source, and validate references/examples.
- Identify the authoritative schema source, compare serializers and route validators, then check references, required/null distinctions and representative examples.

## Decision branches

- **When generated schema disagrees with runtime behavior:** Correct the source of generation or document a deliberate contract change; do not patch generated output alone.

## Deliver and verify

- Validated specification and a list of remaining behavior discrepancies.
- Covered routes, schema/example validation and unresolved runtime discrepancies.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Examples conform to declared schemas; missing error responses are represented accurately.

## Stop and recover

- Do not silently change runtime behavior to match stale documentation or overwrite generated files without updating their source.

## Example requests

- **Normal (apply):** Reconcile the existing specification with actual request and error schemas.
- **edge (apply):** Document nullable fields and a rate-limit response omitted from generated output.
- **blocked (inspect):** Review supplied schema without running the provider; do not claim runtime conformance.
