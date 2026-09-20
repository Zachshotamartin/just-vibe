---
name: ml-debug-training
description: "Investigate exploding loss, unstable gradients, NaNs, or failure to learn"
---

# ml-debug-training

Investigate exploding loss, unstable gradients, NaNs, or failure to learn

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; failing run logs/configuration, batches, model, and training symptom.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Numerical instability, shape/device issues, data/target mismatch, gradients, and failure to learn.

None by default. Plan artifacts may be saved when requested.

## Execute

- Check inputs/loss/optimizer state, compare expected scales, isolate a small batch, propose or run authorized overfit/gradient probes, and test the leading cause.

## Deliver and verify

- Diagnosis, minimal corrective change when requested, and controlled evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- NaNs are localized to their first source; an inability to overfit a tiny batch prompts pipeline investigation rather than a larger model.

## Stop and recover

- No unbounded retraining or random parameter changes. Preserve failed-run evidence and distinguish numerical repair from generalization improvement.

## Example request

Diagnose NaNs from this run's first failing batch and gradient logs.
