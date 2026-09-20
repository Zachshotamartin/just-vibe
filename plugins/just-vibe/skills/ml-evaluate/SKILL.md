---
name: ml-evaluate
description: "Evaluate using task-appropriate metrics and baselines"
---

# ml-evaluate

Evaluate using task-appropriate metrics and baselines

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; model, dataset/split, task metrics, baseline, and inference budget. Explicit evaluation execution selects apply.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Fixed-protocol performance evaluation, not model tuning.

None by default. Plan artifacts may be saved when requested.

## Execute

- Validate alignment and eligibility, run authorized predictions, compute declared metrics and appropriate uncertainty, compare baseline, and record excluded/missing cases.

## Deliver and verify

- Reproducible evaluation report with data/model identity, metrics, denominators, and limitations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Prediction/label misalignment fails validation; missing predictions are counted rather than silently dropped into better scores.

## Stop and recover

- No test-set-driven changes during evaluation. Missing ground truth restricts output to operational/descriptive checks.

## Example request

Plan evaluating the frozen model against the declared baseline and untouched test split.
