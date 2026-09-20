---
name: ml-serving
description: "Implement online inference with validation and observable errors"
---

# ml-serving

Implement online inference with validation and observable errors

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; model package, request/response contract, latency/resource constraints, and target runtime.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Online inference service code and isolated validation; live hosting requires a deployment request.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Validate inputs, manage model lifecycle/readiness, enforce resource/time limits, map errors, add redacted observability, and test concurrent valid/invalid requests.

## Deliver and verify

- Service, configuration, operational checks, and performance evidence if measured.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid shapes/types fail safely; readiness does not pass before the correct model is usable.

## Stop and recover

- No live endpoint provisioning or model registry mutation implicitly. Do not log raw sensitive inference inputs by default.

## Example request

Implement local inference with validation, readiness, and safe error handling.
