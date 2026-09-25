---
name: integrate
description: "Connect an API, library, or external service. Use to connect an external capability through a narrow boundary; api-client focuses on the transport client and api-webhooks owns verified inbound events."
---

# integrate

Connect an API, library, or external service.

## Choose this workflow

Use to connect an external capability through a narrow boundary; api-client focuses on the transport client and api-webhooks owns verified inbound events.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; service/library, intended use, environment, and credentials mechanism. Requires supported interface documentation and local integration points.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Client/server adapter, configuration names, errors, and tests; no account purchase or live side effects unless requested.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Resolve the provider version and request/response schemas, and verify compatibility with the project.
2. Implement a narrow boundary that keeps secrets out of code and logs and adds timeout and error behavior.
3. Validate against a controlled fake or sandbox for success, refusal, timeout and malformed replies before any live verification.

## Technical method

- **Inspect:** Resolve provider/library version, credentials ownership, request/response contracts and failure semantics.
- **Method:** Use the supported client and boundary adaptation, validate external data and reconcile uncertain mutating responses.
- **Avoid misdiagnosis:** A mock success does not prove provider configuration, and retrying after timeout can duplicate a remote effect.
- **Check the result:** Exercise a controlled successful exchange, rejected/malformed response and timeout, recording which boundaries were real.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).

## Decision branches

- **When a timeout may follow a completed external mutation:** Reconcile by stable operation identity before retrying, and expose uncertainty to the caller.
- **When the provider reports results by callback or webhook:** Implement or reuse a verified receiver with api-webhooks (raw-body signature check, idempotent receipt, replay window) and reconcile state from it, not from client redirects.

## Deliver and verify

- Integration code behind a boundary contract, configuration names and instructions, a failure matrix, and fake or sandbox validation evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A valid response works; authentication failure or timeout produces a useful recoverable error.

## Stop and recover

- Missing credentials block live verification only. Never hard-code secrets or imply sandbox checks prove production readiness.

## Example requests

- **Normal (apply):** Connect the sandbox shipping API using our existing HTTP client.
- **Edge (apply):** Integrate a provider whose timed-out request may still create an order.
- **Blocked (inspect):** Design and inspect the integration without credentials; do not invent a successful sandbox call.
