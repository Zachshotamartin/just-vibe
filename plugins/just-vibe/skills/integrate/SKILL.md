---
name: integrate
description: "Connect an API, library, or external service Use to connect an external capability through a narrow boundary; api-client focuses on the transport client."
---

# integrate

Connect an API, library, or external service

## Choose this workflow

Use to connect an external capability through a narrow boundary; api-client focuses on the transport client.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; service/library, intended use, environment, and credentials mechanism. Requires supported interface documentation and local integration points.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Client/server adapter, configuration names, errors, and tests; no account purchase or live side effects unless requested.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Verify compatibility, implement a narrow boundary, protect secrets, add timeout/error behavior, and validate with a sandbox or controlled fixture.
- Resolve provider version and request/response schemas; implement a controlled fake for success, refusal, timeout and malformed replies before live verification.

## Decision branches

- **When a timeout may follow a completed external mutation:** Reconcile by stable operation identity before retrying, and expose uncertainty to the caller.

## Deliver and verify

- Integration code, configuration instructions, failure handling, and validation evidence.
- Boundary contract, configuration names, failure matrix and sandbox evidence when available.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A valid response works; authentication failure or timeout produces a useful recoverable error.

## Stop and recover

- Missing credentials block live verification only. Never hard-code secrets or imply sandbox checks prove production readiness.

## Example requests

- **Normal (apply):** Connect the sandbox shipping API using our existing HTTP client.
- **edge (apply):** Integrate a provider whose timed-out request may still create an order.
- **blocked (inspect):** Design and inspect the integration without credentials; do not invent a successful sandbox call.
