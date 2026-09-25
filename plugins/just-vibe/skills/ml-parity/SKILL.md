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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; training and serving pipelines/artifacts plus representative versioned inputs. Apply for a requested preprocessing fix or parity regression fixtures.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

- **Infer from evidence:** Read artifact format/trust, preprocessing schema, serving runtime, compatibility and existing rollout controls.
- **Reasonable default:** Prepare packaging/configuration and isolated checks without treating them as a live deployment.
- **Ask only when needed:** Resolve the target, rollback compatibility and operating limits before rollout or load generation; missing production access does not block packaging.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Preprocessing, feature order, types, defaults, model version, and numerical parity.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: edit the requested local implementation and perform relevant bounded checks while preserving unrelated work. Live data changes, remote actions and paid jobs require their resolved target and existing session authorization.

## Execute

1. Align raw inputs and versions, compare each transformation boundary, localize first divergence, evaluate declared tolerances, and propose fixes, applying a requested one in apply mode.
2. Feed identical raw rows through each pipeline and compare schema, feature names/order, transformations and model outputs at each boundary.
## Technical method

- **Inspect:** Compare fitted preprocessing, feature ordering, units, categorical vocabularies, missingness and runtime numerics.
- **Method:** Send the same golden inputs through training transformation and packaged serving transformation before comparing predictions.
- **Avoid misdiagnosis:** Equal tensor shape does not imply equal feature meaning; silently reordered columns can produce plausible wrong scores.
- **Check the result:** Include missing, unseen, zero and boundary inputs and locate the first differing transform rather than comparing only final accuracy.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML deployment worked example](../../references/examples/ml-deployment.md).


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
