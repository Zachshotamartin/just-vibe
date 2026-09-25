---
name: ml-serving
description: "Implement online inference with validation and observable errors. Use to implement model service behavior; ml-rollout plans traffic transition."
---

# ml-serving

Implement online inference with validation and observable errors.

## Choose this workflow

Use to implement model service behavior; ml-rollout plans traffic transition.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; model package, request/response contract, latency/resource constraints, and target runtime.

**Pack prerequisites:** Versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

- **Infer from evidence:** Read artifact format/trust, preprocessing schema, serving runtime, compatibility and existing rollout controls.
- **Reasonable default:** Prepare packaging/configuration and isolated checks without treating them as a live deployment.
- **Ask only when needed:** Resolve the target, rollback compatibility and operating limits before rollout or load generation; missing production access does not block packaging.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Online inference service code and isolated validation; live hosting requires a deployment request.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Validate inputs, manage model lifecycle/readiness, enforce resource/time limits, map errors, add redacted observability, and test concurrent valid/invalid requests.
2. Define readiness for the correct artifact, input bounds, batching/concurrency and deadlines; validate shapes/types before inference and preserve version in responses/telemetry.

## Technical method

- **Inspect:** Resolve request schema, batching, concurrency, model lifecycle, device memory and timeout budget.
- **Method:** Validate inputs before inference, bound queues and separate loading failures from invalid requests; define model identity per response/trace.
- **Avoid misdiagnosis:** Unbounded batches or concurrent model copies can exhaust memory; returning a default prediction hides infrastructure failure.
- **Check the result:** Exercise valid/invalid inputs, queue saturation, model-load failure and cancellation; verify bounded resources and typed errors.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML deployment worked example](../../references/examples/ml-deployment.md).


## Decision branches

- **When model loading fails or an incompatible schema arrives:** Fail readiness or return a typed request error without serving an unidentified fallback.

## Deliver and verify

- Service, configuration, operational checks, and performance evidence if measured.
- Serving contract, lifecycle, failure handling and concurrent valid/invalid checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid shapes/types fail safely; readiness does not pass before the correct model is usable.

## Stop and recover

- No live endpoint provisioning or model registry mutation implicitly. Do not log raw sensitive inference inputs by default.

## Example requests

- **Normal (apply):** Implement local inference with validation, readiness, and safe error handling.
- **Edge (apply):** Serve a model with bounded batch size and a failed startup load.
- **Blocked (inspect):** Design serving code without provisioning an endpoint or logging raw sensitive inputs.
