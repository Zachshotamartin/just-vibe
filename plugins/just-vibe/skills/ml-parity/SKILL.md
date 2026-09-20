---
name: ml-parity
description: "Check training preprocessing against production inference Use to compare training and serving transformations; ml-drift compares populations over time."
---

# ml-parity

Check training preprocessing against production inference

## Choose this workflow

Use to compare training and serving transformations; ml-drift compares populations over time.

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
- Feed identical raw rows through each pipeline and compare schema, feature names/order, transformations and model outputs at each boundary.

## Decision branches

- **When model/artifact versions differ:** Resolve version identity before attributing output differences solely to preprocessing.

## Deliver and verify

- Parity report with stage-level differences and regression fixtures.
- First divergent boundary, aligned inputs/versions and semantic versus numerical differences.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Reordered features are detected; expected floating-point variance is separated from semantic mismatch.

## Stop and recover

- Missing training transforms or serving access limits coverage. Do not compare outputs from different model versions as a pure preprocessing test.

## Example requests

- **Normal (inspect):** Compare training and serving transformations on these exact versioned inputs.
- **edge (inspect):** Diagnose high offline scores but poor serving due to reordered features.
- **blocked (inspect):** Assess parity with missing training transforms; keep unobserved stages unknown.
