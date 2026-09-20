---
name: ml-batch
description: "Build resumable batch inference and output tracking"
---

# ml-batch

Build resumable batch inference and output tracking

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for implementation; model/data versions, partitioning, output keys, checkpoint destination, and run budget.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Resumable batch inference; real dataset execution must be part of the request.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Validate schemas, create stable row/partition identities, implement checkpointed writes, track failures and model versions, and test resume/replay on controlled input.

## Deliver and verify

- Batch job, progress/output manifest, error policy, and resume evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Restart does not duplicate completed outputs; invalid records are accounted for rather than silently lost.

## Stop and recover

- No unbounded full-dataset inference. Do not mix predictions from incompatible model versions in one unlabeled output.

## Example request

Implement resumable batch inference with stable output keys and model-version tracking.
