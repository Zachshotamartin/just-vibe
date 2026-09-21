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

- **Infer from evidence:** Read framework, training entry point, loss/metric, split manifests and checkpoint conventions from supplied source.
- **Reasonable default:** Implement requested code and tiny isolated smoke checks with existing tools; leave unmeasured model quality explicit.
- **Ask only when needed:** Ask for unresolved objective/data semantics before encoding them, and environment/resource limits before launching training or a search; implementation alone does not need a hardware purchase decision.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Numerical instability, shape/device issues, data/target mismatch, gradients, and failure to learn.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Check inputs/loss/optimizer state, compare expected scales, isolate a small batch, propose or run authorized overfit/gradient probes, and test the leading cause.
2. Inspect one batch's shapes, labels, scale, loss and gradients, locate the first non-finite value and compare optimizer updates with the intended objective.
## Technical method

- **Inspect:** Capture the first divergent batch, activations/loss, gradient finiteness and parameter update.
- **Method:** Check objective/target semantics and preprocessing before tuning; use a tiny-batch overfit probe to distinguish plumbing from generalization.
- **Avoid misdiagnosis:** Switching architecture can conceal a detached graph, wrong target scale or optimizer that never updates parameters.
- **Check the result:** Verify finite forward/backward values and actual parameter changes on the smallest failing input before a longer run.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML experimentation worked example](../../references/examples/ml-experiments.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).
- The task specifically involves pytorch, autograd, ddp, cuda mismatch; load only the matching method: [PyTorch autograd, device and distributed debugging](../../references/methods/pytorch-debug.md).
- The task specifically involves recommender, ranking metrics, retrieval ranking, ml adoption; load only the matching method: [Retrieval, ranking and recommendation evaluation](../../references/methods/recommender-systems.md).

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
