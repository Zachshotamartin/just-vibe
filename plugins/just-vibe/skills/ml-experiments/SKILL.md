---
name: ml-experiments
description: "Compare runs and check that data and evaluation conditions match Use to compare recorded runs; ml-train produces a run and ml-report communicates validated conclusions."
---

# ml-experiments

Compare runs and check that data and evaluation conditions match

## Choose this workflow

Use to compare recorded runs; ml-train produces a run and ml-report communicates validated conclusions.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML experimentation methods](../../references/packs/ml-experiments.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; run IDs/artifacts, metric of interest, and comparison scope.

dataset/split manifests, fixed objective/metric, environment/dependencies, baseline where applicable, and explicit compute limits. Record code revision, configuration, seeds, artifact paths, and resource use. Local smoke checks do not imply authorization for paid training. Never optimize on the held-out test set.

- **Infer from evidence:** Read framework, training entry point, loss/metric, split manifests and checkpoint conventions from supplied source.
- **Reasonable default:** Implement requested code and tiny isolated smoke checks with existing tools; leave unmeasured model quality explicit.
- **Ask only when needed:** Ask for unresolved objective/data semantics before encoding them, and environment/resource limits before launching training or a search; implementation alone does not need a hardware purchase decision.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Compare existing experiments and their compatibility; no automatic reruns.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Reconcile data/split/code/config identities, normalize metric definitions, inspect failed/missing runs, compare quality and resources, and separate incompatible cohorts.
2. Reconcile dataset/split/code/config identities, metric denominator and selection history; include failed/pruned runs in total resource accounting.
3. For supplied binary/regression run exports, follow the experiments guide to import actual provider metadata and aligned prediction rows with dataset/split, code/model identity, preprocessing, seed and feature maps. Keep provider-reported metrics separate from recomputed metrics; do not log into a provider or train merely to import.
4. Compare only fresh compatible task/dataset/split and row/target/slice identities. Suppress deltas when incompatible or stale. Explain overall and per-slice changes together, small denominators, missing dimensions, threshold changes, feature parity mismatches and temporal check coverage.
5. Investigate an aggregate gain with a subgroup regression before making a recommendation. Supplied metadata is attributed evidence, matching feature maps do not execute preprocessing, and observed differences do not establish cause. Reconcile unexported/missing predictions and use project tooling for uncertainty, unsupported tasks or larger data.
## Technical method

- **Inspect:** Inspect run manifests, data/split identity, metric definitions, code, failures and selection history.
- **Method:** Group only comparable runs and flag differences that change the question; keep cost and failure rates beside headline scores.
- **Avoid misdiagnosis:** Same metric names may hide different denominators, positive classes or evaluation populations.
- **Check the result:** Recompute a small metric from retained predictions and reject or qualify comparisons with incompatible protocols.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [ML experimentation worked example](../../references/examples/ml-experiments.md).
- Comparing supplied MLflow, W&B or JSON runs with row-level predictions: [Recorded experiment comparisons](../../references/experiments.md).

## Decision branches

- **When runs used different populations or metric definitions:** Group them separately and propose a matched comparison instead of a misleading leaderboard.

## Deliver and verify

- Experiment comparison, strongest supported result, and comparability gaps.
- Comparable-run groups, quality/resource evidence and missing metadata.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Different test populations are not ranked as directly comparable; failed trials are not silently omitted from cost accounting.

## Stop and recover

- Missing metadata prevents strong conclusions. Do not select a winner solely from rounded headline scores.

## Example requests

- **Normal (inspect):** Compare these runs and flag different datasets or metric definitions.
- **edge (inspect):** Compare experiments that used different test periods and rounded headline scores.
- **blocked (inspect):** Inspect incomplete run exports without inventing missing metrics or costs.
