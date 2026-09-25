---
name: api-design
description: "Define endpoints, resources, validation, and response contracts. Use to design consumer-visible operations; backend-service implements business behavior."
---

# api-design

Define endpoints, resources, validation, and response contracts.

## Choose this workflow

Use to design consumer-visible operations; backend-service implements business behavior.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; resources/actions, consumers, access rules, and compatibility requirements.

**Pack prerequisites:** Interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

- **Infer from evidence:** Read producer/consumer schemas, error contracts, auth conventions and known supported client versions.
- **Reasonable default:** Keep compatible response and pagination semantics where the brief does not request a breaking change.
- **Ask only when needed:** Ask when contract sources disagree or an unknown consumer changes compatibility; do not require live credentials to write or test an isolated client.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Endpoint/interface shape, validation, response/error contracts, and evolution.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Inspect domain conventions and existing APIs, define consistent resources and operations, specify normal/error behavior, and check consumer usability and migration needs.
2. Define resource identity, method semantics, validation, authorization, errors and versioning from actual consumer journeys; include one success and failure exchange.

## Technical method

- **Inspect:** Read consumer needs, resource ownership, identity, transport constraints and current serializer behavior.
- **Method:** Specify valid/error exchanges, missing versus null, units, limits, idempotency and authorization before editing handlers.
- **Avoid misdiagnosis:** Consistent JSON shape alone does not establish consistent business meaning or access control.
- **Check the result:** Exercise representative valid, invalid, unauthorized and dependency-failure requests against the actual handler boundary.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [APIs worked example](../../references/examples/api.md).
- Identity, ownership, tenant isolation, replay or privilege changes affect the task: [Identity and authorization](../../references/security/identity.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).

## Decision branches

- **When a proposed endpoint hides several independently failing effects:** Expose operation state or explicit partial-failure semantics instead of implying atomic success.

## Deliver and verify

- API proposal with request/response examples, invariants, and acceptance scenarios.
- Request/response examples, status/error meanings and consumer compatibility notes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid and unauthorized requests have defined outcomes; new behavior does not silently break an existing consumer.

## Stop and recover

- Do not choose unresolved business policy or implement endpoints during a design-only request.

## Example requests

- **Normal (plan):** Design invitation endpoints with explicit expiry and conflict responses.
- **Edge (plan):** Design an asynchronous export API that can fail after acceptance.
- **Blocked (inspect):** Draft an API with unknown consumer constraints; mark compatibility assumptions.
