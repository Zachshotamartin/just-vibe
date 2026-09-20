---
name: ml-drift
description: "Design checks for input or prediction-distribution changes Use for observed input/prediction distribution change; ml-evaluate requires outcomes to establish quality."
---

# ml-drift

Design checks for input or prediction-distribution changes

## Choose this workflow

Use for observed input/prediction distribution change; ml-evaluate requires outcomes to establish quality.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML deployment methods](../../references/packs/ml-deployment.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; reference/current data or prediction windows, features, seasonality, and sensitivity requirements.

versioned model and preprocessing artifacts, input/output schema, runtime/dependencies, operating targets, and authorized environment. Validate artifact trust before loading formats that can execute code. Packaging or writing monitoring configuration does not deploy a model or enable a hosted service.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Distribution-change detection and investigation; no automatic retraining.

None by default. Plan artifacts may be saved when requested.

## Execute

- Align schemas/windows, choose meaningful per-feature and aggregate checks, account for sample size/seasonality, inspect effect sizes, and define follow-up on signals.
- Align schema, sampling and seasonal windows, compare effect sizes and support changes and separate data-pipeline changes from population changes.

## Decision branches

- **When drift is statistically significant but outcomes are unavailable:** Report a monitoring signal and follow-up, not confirmed accuracy degradation.

## Deliver and verify

- Drift protocol or report with baselines, thresholds, uncertainty, and investigation guidance.
- Baseline/current identities, shift measures, sample sizes and next evidence needed.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A changed categorical support is detected; a statistically significant tiny shift is not automatically called model failure.

## Stop and recover

- Drift is not proof of accuracy degradation without outcome evidence. Baseline refresh requires explicit policy, not silent adaptation.

## Example requests

- **Normal (plan):** Plan distribution checks that account for seasonality and sample size.
- **edge (plan):** Investigate a new categorical value and a seasonal traffic shift.
- **blocked (inspect):** Assess drift from aggregates without inferring model failure or silently refreshing the baseline.
