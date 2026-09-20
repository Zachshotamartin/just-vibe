---
name: ml-baseline
description: "Establish simple, reproducible baselines Use for a first comparable benchmark; ml-tune searches hyperparameters after protocol validity."
---

# ml-baseline

Establish simple, reproducible baselines

## Choose this workflow

Use for a first comparable benchmark; ml-tune searches hyperparameters after protocol validity.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan a baseline comparison; apply for requested baseline code or a bounded experiment.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

- **Infer from evidence:** Read framework, training entry point, loss/metric, split manifests and checkpoint conventions from supplied source.
- **Reasonable default:** Implement requested code and tiny isolated smoke checks with existing tools; leave unmeasured model quality explicit.
- **Ask only when needed:** Ask for unresolved objective/data semantics before encoding them, and environment/resource limits before launching training or a search; implementation alone does not need a hardware purchase decision.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Simple reproducible reference models, including a naive/rule-based comparator.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Match baseline to task, build leakage-safe preprocessing, fix evaluation protocol, run bounded training when authorized, and report score plus cost/uncertainty.
2. Include a task-appropriate constant/rule baseline and simple model, use the same splits and preprocessing fit boundaries and record resources alongside quality.
## Technical method

- **Inspect:** Resolve task, split, target availability, metric and naive prediction policy.
- **Method:** Evaluate a constant/last-value or other task-appropriate naive model and a simple fitted model under identical preprocessing and data boundaries.
- **Avoid misdiagnosis:** A strong model with a different split is not a fair baseline; test-set selection makes later comparisons optimistic.
- **Check the result:** Preserve predictions, denominators and protocol identity and verify the baseline handles the same missing/rare cases as candidate models.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML experimentation worked example](../../references/examples/ml-experiments.md).


## Decision branches

- **When the baseline wins or matches within uncertainty:** Keep the simpler option and identify the missing signal before expanding model search.
- **When the request is for local preparation or implementation:** Implement the requested simple baseline and evaluation interface; use a small labeled fixture to check the pipeline without claiming predictive quality.

## Deliver and verify

- Baseline configuration/code and results if executed.
- Data/split identity, baseline/model comparison, metric definitions and compute record.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A naive comparator is included; all candidates use identical permitted evaluation data.

## Stop and recover

- Do not begin extensive model search. Missing label/split validity blocks trustworthy benchmark claims even if training technically runs.

## Example requests

- **Normal (plan):** Plan reproducible naive and simple-model baselines under the fixed split.
- **edge (plan):** Establish a baseline when class imbalance makes accuracy misleading.
- **blocked (inspect):** Plan a baseline with unresolved label maturity; do not claim trustworthy scores.
