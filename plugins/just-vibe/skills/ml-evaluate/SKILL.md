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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Inspect supplied evaluation results; apply for requested evaluator implementation or scoped evaluation execution.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

- **Infer from evidence:** Read frozen model/data identities, metric definitions, denominators and supplied predictions; separate validation from test use.
- **Reasonable default:** Compute only supported metrics on permitted samples and label missing labels or subgroup coverage as unknown.
- **Ask only when needed:** Ask when the operating cost/threshold or population changes the evaluation decision; do not fabricate labels to avoid a question.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Fixed-protocol performance evaluation, not model tuning.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Validate alignment and eligibility, run authorized predictions, compute declared metrics and appropriate uncertainty, compare baseline, and record excluded/missing cases.
2. Align predictions and labels by stable row identity, freeze eligibility/metric definitions and count missing, excluded and failed predictions before computing results.
3. For supplied binary/regression run exports, follow the experiments guide to import actual provider metadata and aligned prediction rows with dataset/split, code/model identity, preprocessing, seed and feature maps. Keep provider-reported metrics separate from recomputed metrics; do not log into a provider or train merely to import.
4. Compare only fresh compatible task/dataset/split and row/target/slice identities. Suppress deltas when incompatible or stale. Explain overall and per-slice changes together, small denominators, missing dimensions, threshold changes, feature parity mismatches and temporal check coverage.
5. Investigate an aggregate gain with a subgroup regression before making a recommendation. Supplied metadata is attributed evidence, matching feature maps do not execute preprocessing, and observed differences do not establish cause. Reconcile unexported/missing predictions and use project tooling for uncertainty, unsupported tasks or larger data.
## Technical method

- **Inspect:** Resolve metric formula/direction, positive class, sample weights, population, split and retained predictions.
- **Method:** Compare appropriate baselines and quantify sampling uncertainty respecting groups/time dependence.
- **Avoid misdiagnosis:** Treating every correlated row as independent can make confidence intervals artificially narrow.
- **Check the result:** Hand-check a small confusion matrix or error calculation, preserve denominators and keep test data out of model selection.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML evaluation worked example](../../references/examples/ml-evaluation.md).
- Comparing supplied MLflow, W&B or JSON runs with row-level predictions: [Recorded experiment comparisons](../../references/experiments.md).

## Decision branches

- **When observations are dependent within entities or time blocks:** Use an uncertainty method matching that dependence or explicitly leave uncertainty unestimated.
- **When aggregate performance improves while a slice regresses:** Show denominators and both outcomes, inspect parity/temporal issues and avoid ranking an incompatible evaluation.
- **When the request is for local preparation or implementation:** Implement the metric and slice evaluator with known-label controls; missing production labels limit conclusions without blocking evaluator code.

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
