---
name: ml-imbalance
description: "Evaluate sampling, weighting, metrics, and thresholds for rare outcomes Use when rare outcomes affect metrics or training; ml-threshold selects operational decisions."
---

# ml-imbalance

Evaluate sampling, weighting, metrics, and thresholds for rare outcomes

## Choose this workflow

Use when rare outcomes affect metrics or training; ml-threshold selects operational decisions.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; prevalence, class definitions, error costs/capacity, and split protocol.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Sampling/weighting, evaluation, and operating-point options for rare outcomes.

None by default. Plan artifacts may be saved when requested.

## Execute

- Establish naive baselines, inspect per-class/sample counts, choose suitable metrics, compare resampling/weighting only within training folds, and assess deployment prevalence effects.
- Compute baseline prevalence and class counts by split, choose task-relevant precision/recall measures and restrict resampling to training folds.

## Decision branches

- **When prevalence differs between sampled training and deployment:** Separate learned ranking from probability calibration and expected operational workload.

## Deliver and verify

- Imbalance strategy with bounded experiments and threshold considerations.
- Baselines, per-class denominators, resampling protocol and uncertainty limits.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A high-accuracy all-negative model is not accepted as useful; resampled training prevalence is not confused with deployed probability calibration.

## Stop and recover

- Do not synthesize across validation/test boundaries or invent business tradeoffs. Low positive counts require uncertainty disclosure.

## Example requests

- **Normal (plan):** Compare weighting and metrics for rare fraud with limited review capacity.
- **edge (plan):** Compare a high-accuracy all-negative baseline against a rare-event model.
- **blocked (inspect):** Assess imbalance with few positives; do not invent stable confidence or business costs.
