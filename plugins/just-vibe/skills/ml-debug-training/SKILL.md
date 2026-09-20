---
name: ml-debug-training
description: "Investigate exploding loss, unstable gradients, NaNs, or failure to learn Use for NaNs, shape/device errors or non-learning; ml-error-analysis studies generalization failures."
---

# ml-debug-training

Investigate exploding loss, unstable gradients, NaNs, or failure to learn

## Choose this workflow

Use for NaNs, shape/device errors or non-learning; ml-error-analysis studies generalization failures.

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
- Inspect one batch's shapes, labels, scale, loss and gradients, locate the first non-finite value and compare optimizer updates with the intended objective.

## Decision branches

- **When a tiny-batch overfit probe fails:** Investigate data/loss/gradient/update plumbing before larger architectures or more epochs.

## Deliver and verify

- Diagnosis, minimal corrective change when requested, and controlled evidence.
- First divergent tensor/step, hypothesis evidence and bounded corrective probe.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- NaNs are localized to their first source; an inability to overfit a tiny batch prompts pipeline investigation rather than a larger model.

## Stop and recover

- No unbounded retraining or random parameter changes. Preserve failed-run evidence and distinguish numerical repair from generalization improvement.

## Example requests

- **Normal (inspect):** Diagnose NaNs from this run's first failing batch and gradient logs.
- **edge (inspect):** Debug a loss that becomes NaN only after mixed-precision updates.
- **blocked (inspect):** Inspect saved training logs without retraining or guessing a learning-rate cure.
