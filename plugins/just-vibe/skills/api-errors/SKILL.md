---
name: api-errors
description: "Standardize useful error responses and propagation"
---

# api-errors

Standardize useful error responses and propagation

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; API scope, current error format, consumers, and logging requirements.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Error status, machine-readable codes, safe messages, propagation, and trace correlation.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inventory errors, preserve required compatibility, map domain failures deliberately, redact internals, and test representative client/server failures.

## Deliver and verify

- Consistent error handling, documented contract, and checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Validation errors identify usable field problems; unexpected failures do not leak stack traces or credentials.

## Stop and recover

- Do not turn all failures into success responses or change public codes silently. Unknown consumer reliance needs compatibility handling.

## Example request

Standardize safe API errors while preserving published machine-readable codes.
