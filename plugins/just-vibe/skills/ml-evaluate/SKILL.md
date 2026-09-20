---
name: ml-evaluate
description: "Evaluate using task-appropriate metrics and baselines Use for fixed-model evaluation; ml-threshold and ml-calibrate require separate selection data."
---

# ml-evaluate

Evaluate using task-appropriate metrics and baselines

## Choose this workflow

Use for fixed-model evaluation; ml-threshold and ml-calibrate require separate selection data.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; model, dataset/split, task metrics, baseline, and inference budget. Explicit evaluation execution selects apply.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Fixed-protocol performance evaluation, not model tuning.

None by default. Plan artifacts may be saved when requested. Explicit import requests permit local normalized experiment records; comparison does not train or deploy.

## Execute

- Validate alignment and eligibility, run authorized predictions, compute declared metrics and appropriate uncertainty, compare baseline, and record excluded/missing cases.
- Align predictions and labels by stable row identity, freeze eligibility/metric definitions and count missing, excluded and failed predictions before computing results.
- For supplied binary/regression run exports, follow the experiments guide to import actual provider metadata and aligned prediction rows with dataset/split, code/model identity, preprocessing, seed and feature maps. Keep provider-reported metrics separate from recomputed metrics; do not log into a provider or train merely to import.
- Compare only fresh compatible task/dataset/split and row/target/slice identities. Suppress deltas when incompatible or stale. Explain overall and per-slice changes together, small denominators, missing dimensions, threshold changes, feature parity mismatches and temporal check coverage.
- Investigate an aggregate gain with a subgroup regression before making a recommendation. Supplied metadata is attributed evidence, matching feature maps do not execute preprocessing, and observed differences do not establish cause. Reconcile unexported/missing predictions and use project tooling for uncertainty, unsupported tasks or larger data.

## Read when relevant

- Comparing supplied MLflow, W&B or JSON runs with row-level predictions: [Recorded experiment comparisons](../../references/experiments.md).

## Decision branches

- **When observations are dependent within entities or time blocks:** Use an uncertainty method matching that dependence or explicitly leave uncertainty unestimated.
- **When aggregate performance improves while a slice regresses:** Show denominators and both outcomes, inspect parity/temporal issues and avoid ranking an incompatible evaluation.

## Deliver and verify

- Reproducible evaluation report with data/model identity, metrics, denominators, and limitations.
- Model/data/split identity, denominators, baseline metrics and uncertainty method.
- Normalized imported runs, actual input hashes, recomputed aggregate/slice metrics, comparability and parity/temporal findings.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Prediction/label misalignment fails validation; missing predictions are counted rather than silently dropped into better scores.

## Stop and recover

- No test-set-driven changes during evaluation. Missing ground truth restricts output to operational/descriptive checks.

## Example requests

- **Normal (plan):** Plan evaluating the frozen model against the declared baseline and untouched test split.
- **edge (plan):** Evaluate shuffled prediction rows with missing outputs and delayed labels.
- **blocked (inspect):** Evaluate operational behavior without ground truth; do not report accuracy.
