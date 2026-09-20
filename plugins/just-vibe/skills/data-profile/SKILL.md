---
name: data-profile
description: "Summarize distributions, missingness, duplicates, and suspicious values"
---

# data-profile

Summarize distributions, missingness, duplicates, and suspicious values

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

## Deliver and verify

- Profile with sample/full-scan distinction, counts, caveats, and follow-up checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Missing and sentinel values are separated; sample statistics are not presented as exact full-population counts.

## Stop and recover

- Unknown volume triggers size inspection before scanning. Do not print sensitive row-level data unnecessarily.

## Example request

Profile missingness and duplicates in this bounded dataset sample.
