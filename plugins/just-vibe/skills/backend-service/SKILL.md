---
name: backend-service
description: "Implement a service with clear boundaries and validation"
---

# backend-service

Implement a service with clear boundaries and validation

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

## Deliver and verify

- Service implementation, interfaces, configuration guidance, and checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A valid operation persists the intended effect; validation/dependency failure leaves a consistent state.

## Stop and recover

- Do not invent business rules or create production infrastructure. Missing external credentials block live verification, not local contract work.

## Example request

Implement a narrow invitation service using existing validation and persistence patterns.
