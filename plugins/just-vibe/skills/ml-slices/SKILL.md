---
name: ml-slices
description: "Compare meaningful cohorts or operating conditions Use for cohort performance comparisons; ml-error-analysis investigates individual failure mechanisms."
---

# ml-slices

Compare meaningful cohorts or operating conditions

## Choose this workflow

Use for cohort performance comparisons; ml-error-analysis investigates individual failure mechanisms.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; predictions/labels, meaningful cohorts, minimum sample guidance, and operating context.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Performance across cohorts/time/conditions and coverage gaps.

None by default. Plan artifacts may be saved when requested. Explicit import requests permit local normalized experiment records; comparison does not train or deploy.

## Execute

- Predefine important slices where possible, compute counts and metrics consistently, account for dependent samples, flag small groups, and distinguish exploratory comparisons.
- Define important slices and overlap, compute consistent counts/metrics and distinguish planned from exploratory comparisons with small-sample limits.
- For supplied binary/regression run exports, follow the experiments guide to import actual provider metadata and aligned prediction rows with dataset/split, code/model identity, preprocessing, seed and feature maps. Keep provider-reported metrics separate from recomputed metrics; do not log into a provider or train merely to import.
- Compare only fresh compatible task/dataset/split and row/target/slice identities. Suppress deltas when incompatible or stale. Explain overall and per-slice changes together, small denominators, missing dimensions, threshold changes, feature parity mismatches and temporal check coverage.
- Investigate an aggregate gain with a subgroup regression before making a recommendation. Supplied metadata is attributed evidence, matching feature maps do not execute preprocessing, and observed differences do not establish cause. Reconcile unexported/missing predictions and use project tooling for uncertainty, unsupported tasks or larger data.

## Technical method

- **Inspect:** Define meaningful cohorts, support counts, denominators, overlap and intended decision.
- **Apply:** Compare performance and uncertainty within slices, including missing group attributes and intersectional cases where supported.
- **Avoid misdiagnosis:** Tiny slices and many comparisons can produce dramatic noise; aggregate improvement can hide a harmed cohort.
- **Check the result:** Report counts and uncertainty with each metric and verify membership logic on hand-labeled examples.

## Read when relevant

- Comparing supplied MLflow, W&B or JSON runs with row-level predictions: [Recorded experiment comparisons](../../references/experiments.md).

## Decision branches

- **When a cohort has no outcomes or very few positives:** Report unavailable/unstable evidence rather than a confident zero or perfect score.
- **When aggregate performance improves while a slice regresses:** Show denominators and both outcomes, inspect parity/temporal issues and avoid ranking an incompatible evaluation.

## Deliver and verify

- Slice table, uncertainty, worst-supported conditions, and follow-up data needs.
- Slice definition, denominator, metric, uncertainty and coverage gaps.
- Normalized imported runs, actual input hashes, recomputed aggregate/slice metrics, comparability and parity/temporal findings.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A tiny cohort's extreme score is qualified; missing cohorts are shown as no evidence rather than zero performance.

## Stop and recover

- Avoid causal or fairness guarantees from a metric table alone. Do not expose identifying small-group records.

## Example requests

- **Normal (inspect):** Compare operating-condition cohorts and report uncertainty for small slices.
- **edge (inspect):** Compare overlapping cohorts with one tiny high-error subgroup.
- **blocked (inspect):** Assess slice coverage without sensitive row-level records or causal fairness claims.
