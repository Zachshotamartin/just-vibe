---
name: ml-features
description: "Design features available at prediction time and test usefulness Use to implement prediction-time feature transformations; ml-labels defines outcomes and ml-leakage audits leakage."
---

# ml-features

Design features available at prediction time and test usefulness

## Choose this workflow

Use to implement prediction-time feature transformations; ml-labels defines outcomes and ml-leakage audits leakage.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, feature sources, availability timing, baseline, and evaluation protocol.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Predictable, reproducible feature engineering and controlled usefulness checks; implement/run when requested.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define row grain, entity/event identity, prediction instant, feature event time, source availability time, revision order and missing behavior. Specify timezone and exact window endpoints. Missing availability evidence blocks historical-validity claims.
- For versioned sources, reconstruct the latest version actually available at each prediction instant before applying its event-time window. A later correction can move an event outside the window; filtering versions first can resurrect an obsolete value. Deduplicate by the documented event/version identity, scoped to the entity where required.
- Fit learned transforms only on eligible training rows within each simulated fit or cross-validation fold. Preserve input ordering/identity and define empty, constant, missing and unseen-category behavior; use the same transformation semantics at serving time.
- Verify exact time boundaries, mixed explicit offsets, late arrivals, corrections, duplicates, negative/zero values and no input mutation. Compare engineered features to an independent tiny example before proposing a usefulness experiment.
- Only claim usefulness after a controlled baseline comparison on the chosen evaluation protocol and compute budget. A correct feature builder alone establishes neither predictive gain nor production readiness.

## Technical method

- **Inspect:** Define feature semantics, prediction-time availability, units, ordering and missing/unseen-value behavior.
- **Apply:** Build transformations in the training/inference pipeline and evaluate usefulness under the same split protocol.
- **Avoid misdiagnosis:** Target encoding or imputation fitted outside the training fold contaminates validation; feature importance is not causal effect.
- **Check the result:** Hand-compute a small example and exercise future-only input, unseen categories and missing values through both train and serving paths.

## Decision branches

- **When records can be corrected after their original event time:** Use availability and revision semantics to reconstruct the visible version first; never join historical predictions to today’s final mutable table without qualification.
- **When no mature training rows remain after eligibility filtering:** Use the documented empty-transform behavior or report the missing training prerequisite. Do not fit preprocessing on validation/test rows to avoid the empty case.

## Deliver and verify

- Feature/time/identity contract, implementation when requested, eligible fitting population, boundary and revision evidence, and separately measured usefulness results if any.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Historical features use only versions available at prediction time. Training transformations exclude held-out and ineligible rows, and preserve the documented empty/constant/missing behavior.

## Stop and recover

- No test-set-driven feature selection. Unsupported availability timing blocks claims that a feature is deployable.

## Example requests

- **Normal (plan):** Plan point-in-time customer features fitted only on training data.
- **edge (apply):** Build categorical features with unseen values and delayed source updates.
- **blocked (inspect):** Design features without trustworthy availability timestamps; do not claim deployability.
