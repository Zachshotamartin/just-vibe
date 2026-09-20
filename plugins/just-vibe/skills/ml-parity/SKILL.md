---
name: ml-parity
description: "Check training preprocessing against production inference"
---

# ml-parity

Check training preprocessing against production inference

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; training and serving pipelines/artifacts plus representative versioned inputs.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Preprocessing, feature order, types, defaults, model version, and numerical parity.

None by default. Plan artifacts may be saved when requested.

## Execute

- Align raw inputs and versions, compare each transformation boundary, localize first divergence, evaluate declared tolerances, and propose or apply requested fixes.

## Deliver and verify

- Parity report with stage-level differences and regression fixtures.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Reordered features are detected; expected floating-point variance is separated from semantic mismatch.

## Stop and recover

- Missing training transforms or serving access limits coverage. Do not compare outputs from different model versions as a pure preprocessing test.

## Example request

Compare training and serving transformations on these exact versioned inputs.
