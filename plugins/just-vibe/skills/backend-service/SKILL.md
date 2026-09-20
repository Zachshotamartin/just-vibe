---
name: backend-service
description: "Implement a service with clear boundaries and validation Use for a domain service implementation; api-design defines transport-facing contracts."
---

# backend-service

Implement a service with clear boundaries and validation

## Choose this workflow

Use for a domain service implementation; api-design defines transport-facing contracts.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; service responsibility, request/event contracts, persistence, and error requirements.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

One service boundary and necessary integration; no unrelated service decomposition.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Reuse domain conventions, validate inputs, separate transport from business rules, implement persistence/error handling, and test observable behavior.
- Identify transaction ownership and domain invariants, keep transport parsing outside business decisions and make dependency failures observable to callers.

## Decision branches

- **When one operation spans local persistence and an external effect:** Define outbox/reconciliation or compensating behavior before claiming atomicity.

## Deliver and verify

- Service implementation, interfaces, configuration guidance, and checks.
- Service contract, effect/transaction boundaries and success/failure checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A valid operation persists the intended effect; validation/dependency failure leaves a consistent state.

## Stop and recover

- Do not invent business rules or create production infrastructure. Missing external credentials block live verification, not local contract work.

## Example requests

- **Normal (apply):** Implement a narrow invitation service using existing validation and persistence patterns.
- **edge (apply):** Implement order creation when notification fails after persistence.
- **blocked (inspect):** Inspect service requirements with an unavailable dependency; use a contract fixture only.
