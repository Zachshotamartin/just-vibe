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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, training/validation split, metric, and run budget. Explicit baseline-run requests select apply.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Simple reproducible reference models, including a naive/rule-based comparator.

None by default. Plan artifacts may be saved when requested.

## Execute

- Match baseline to task, build leakage-safe preprocessing, fix evaluation protocol, run bounded training when authorized, and report score plus cost/uncertainty.
- Include a task-appropriate constant/rule baseline and simple model, use the same splits and preprocessing fit boundaries and record resources alongside quality.

## Technical method

- **Inspect:** Resolve task, split, target availability, metric and naive prediction policy.
- **Apply:** Evaluate a constant/last-value or other task-appropriate naive model and a simple fitted model under identical preprocessing and data boundaries.
- **Avoid misdiagnosis:** A strong model with a different split is not a fair baseline; test-set selection makes later comparisons optimistic.
- **Check the result:** Preserve predictions, denominators and protocol identity and verify the baseline handles the same missing/rare cases as candidate models.

## Decision branches

- **When the baseline wins or matches within uncertainty:** Keep the simpler option and identify the missing signal before expanding model search.

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
