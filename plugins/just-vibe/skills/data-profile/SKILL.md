---
name: data-profile
description: "Summarize distributions, missingness, duplicates, and suspicious values Use for descriptive data inspection; data-quality evaluates declared rules."
---

# data-profile

Summarize distributions, missingness, duplicates, and suspicious values

## Choose this workflow

Use for descriptive data inspection; data-quality evaluates declared rules.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; dataset/snapshot, columns, sampling limit, and task context.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Distributions, missingness, uniqueness, duplicates, ranges, and suspicious values.

None by default. Plan artifacts may be saved when requested.

## Execute

- Validate schema, select a representative bounded sample or authorized aggregate scan, compute summaries, and flag anomalies relative to declared semantics.
- Inspect schema and volume before scanning, distinguish nulls from sentinels and sample across relevant time/group strata with stated selection limits.

## Technical method

- **Inspect:** Establish snapshot, row grain, sample method, units, timezones, sensitive fields and denominator.
- **Apply:** Report missingness, duplicates and distributions by meaningful group; distinguish sample observations from whole-population claims.
- **Avoid misdiagnosis:** Converting numeric-looking IDs or imputing during profiling silently changes evidence.
- **Check the result:** Reconcile row counts and missing-value definitions and inspect bounded anomalies without exporting private rows.

## Decision branches

- **When the sample is convenience-based or filtered:** Label its population and avoid extrapolating exact counts or representativeness.

## Deliver and verify

- Profile with sample/full-scan distinction, counts, caveats, and follow-up checks.
- Snapshot/sample identity, summaries, anomaly examples and coverage limits.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Missing and sentinel values are separated; sample statistics are not presented as exact full-population counts.

## Stop and recover

- Unknown volume triggers size inspection before scanning. Do not print sensitive row-level data unnecessarily.

## Example requests

- **Normal (inspect):** Profile missingness and duplicates in this bounded dataset sample.
- **edge (inspect):** Profile a time-partitioned dataset with sentinel zeros and missing recent partitions.
- **blocked (inspect):** Inspect metadata only when row access is unavailable; do not fabricate distributions.
