---
name: ml-split
description: "Design splits respecting time, groups, entities, and dependencies Use to design evaluation partitions matching deployment; ml-leakage audits actual contamination evidence."
---

# ml-split

Design splits respecting time, groups, entities, and dependencies

## Choose this workflow

Use to design evaluation partitions matching deployment; ml-leakage audits actual contamination evidence.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [ML data methods](../../references/packs/ml-data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; task, entity/group/time dependencies, deployment regime, and dataset version.

task definition, dataset identity, field semantics, entity/time keys, and permission to inspect bounded data. Record prediction moment, label horizon, sampling, and provenance. Preserve held-out evaluation boundaries; no data upload, label alteration, or feature fitting across splits implicitly.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Train/validation/test membership and fitting boundaries; write manifests only when requested.

None by default. Plan artifacts may be saved when requested.

## Execute

- Define deployment population, row/entity dependence, prediction times, model-fit cutoff, outcome horizon and label availability. Decide whether the question concerns future observations of known entities, unseen entities, or separate evaluations of both.
- Specify exact train/validation/test endpoints and an as-of snapshot. Compare timezone-aware instants rather than timestamp strings. Exclude observations that would not yet exist, and distinguish event time from ingestion and label-observation time.
- Determine training eligibility before fitting preprocessing: an otherwise training-period row with an immature outcome must not teach the historical model. Retain unknown held-out labels as unknown where the evaluation contract requires it; zero is a valid observed label.
- Derive group separation, purging or gaps from the stated deployment question and actual dependence/availability evidence. Record deterministic membership and exclusions with reasons; do not invent a universal embargo duration.
- Verify exact boundaries, label maturity, duplicates, relevant group overlap, empty partitions and transform fit membership. Report the number of rows and number with evaluable labels separately.

## Decision branches

- **When the model will serve both known and unseen entities:** Define separate evaluation questions instead of asserting one grouping rule answers both.

## Deliver and verify

- Deployment question, snapshot and split/eligibility rules, deterministic membership/exclusion evidence, transform fit population and overlap/maturity checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- No row, label or learned transform contains information unavailable at the simulated fit/prediction moment. Unknown outcomes stay unknown, and permitted known-entity overlap is distinguished from forbidden leakage.

## Stop and recover

- Do not use random splitting by habit or repeatedly tune the split to improve scores. Document unsupported generalization claims.

## Example requests

- **Normal (plan):** Design time/group splits for overlapping machine sensor windows.
- **edge (plan):** Split overlapping windows for forecasting on known machines and evaluate unseen machines separately.
- **blocked (inspect):** Plan a split with unknown label horizon; do not invent a universal gap duration.
