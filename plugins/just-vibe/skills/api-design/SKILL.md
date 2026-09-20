---
name: api-design
description: "Define endpoints, resources, validation, and response contracts"
---

# api-design

Define endpoints, resources, validation, and response contracts

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [APIs methods](../../references/packs/api.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; resources/actions, consumers, access rules, and compatibility requirements.

interface definitions, producer/consumer source, authentication model, versioning constraints, and isolated test endpoints. External API calls must respect environment, credentials, rate limits, and side-effect scope.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Endpoint/interface shape, validation, response/error contracts, and evolution.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect domain conventions and existing APIs, define consistent resources and operations, specify normal/error behavior, and check consumer usability and migration needs.

## Deliver and verify

- API proposal with request/response examples, invariants, and acceptance scenarios.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid and unauthorized requests have defined outcomes; new behavior does not silently break an existing consumer.

## Stop and recover

- Do not choose unresolved business policy or implement endpoints during a design-only request.

## Example request

Design invitation endpoints with explicit expiry and conflict responses.
