---
name: ml-train
description: "Implement training with checkpoints and recorded configuration"
---

# ml-train

Implement training with checkpoints and recorded configuration

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; model/task, data/splits, objective, hardware, time/cost budget, and artifact destination. Explicit execution selects apply.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Reproducible training with checkpoint/resume and declared stopping criteria.

None by default. Plan artifacts may be saved when requested.

## Execute

- Validate shapes and pipeline, run a small smoke test, record configuration/environment, train within bounds, checkpoint, and evaluate only the permitted validation protocol.

## Deliver and verify

- Training code/run record, checkpoints, metrics, and resume instructions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Interrupted training can resume with identified state; NaNs or budget exhaustion stop clearly without a false completed result.

## Stop and recover

- No paid hardware provisioning implicitly. Do not label the best validation checkpoint as independently test-validated.

## Example request

Plan checkpointed training on one GPU for at most six hours; do not provision compute.
