---
name: ml-calibrate
description: "Assess predicted probabilities against observed outcomes Use to assess or fit probability calibration; ml-threshold maps scores to decisions."
---

# ml-calibrate

Assess predicted probabilities against observed outcomes

## Choose this workflow

Use to assess or fit probability calibration; ml-threshold maps scores to decisions.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML evaluation methods](../../references/packs/ml-evaluation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; predicted probabilities, labels, sampling/prevalence context, and intended use.

frozen model/artifact, evaluation dataset identity, labels where needed, metric definitions, and task/operating context. Report sample counts and uncertainty appropriate to dependencies; avoid repeated test-set tuning. Exploratory findings need fresh confirmation before strong generalization claims.

Declared evidence requirements: `ml.artifacts`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Probability reliability assessment; fitting calibration requires a separate held-out calibration protocol and explicit apply request.

None by default. Plan artifacts may be saved when requested.

## Execute

- Validate probability semantics, inspect reliability by range/cohort, use appropriate scoring measures, and compare any authorized calibrator on untouched evaluation data.
- Check probability semantics, reliability and proper scoring measures; fit any calibrator on permitted data separate from final evaluation and compare by cohort.

## Decision branches

- **When prevalence or sampling changed since calibration:** Assess transfer assumptions and recalibration evidence without claiming ranking quality proves reliable probabilities.

## Deliver and verify

- Calibration report or calibrated artifact with split provenance and checks.
- Calibration protocol, reliability evidence and independent comparison.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Good ranking is not mistaken for calibrated probability; fitting and evaluating a calibrator on identical records is rejected.

## Stop and recover

- Small samples and prevalence shift limit conclusions. Do not alter deployed probabilities without a rollout request.

## Example requests

- **Normal (inspect):** Assess probability calibration from the supplied held-out scores and outcomes.
- **edge (inspect):** Calibrate a model trained on oversampled positives.
- **blocked (inspect):** Review probability outputs with too few outcomes to fit a reliable calibrator.
