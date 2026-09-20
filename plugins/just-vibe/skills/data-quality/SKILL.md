---
name: data-quality
description: "Check freshness, completeness, validity, and consistency Use to evaluate an identified snapshot against declared rules; data-profile discovers descriptive anomalies."
---

# data-quality

Check freshness, completeness, validity, and consistency

## Choose this workflow

Use to evaluate an identified snapshot against declared rules; data-profile discovers descriptive anomalies.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; dataset, quality contract, thresholds, time window, and bounded execution access.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Freshness, completeness, validity, uniqueness, and cross-field consistency.

None by default. Plan artifacts may be saved when requested.

## Execute

- Resolve applicable rules, evaluate against the identified snapshot, separate warnings from failures, compare history where available, and identify likely upstream causes.
- Freeze applicable thresholds before observing results, evaluate completeness/freshness/validity separately and count excluded or unreadable records.

## Technical method

- **Inspect:** Resolve completeness, freshness, validity and consistency rules with denominators and consumer impact.
- **Apply:** Separate no data from valid zero volume; define late-arrival windows and missing-check behavior.
- **Avoid misdiagnosis:** A green dashboard can reflect a query that stopped receiving rows rather than healthy data.
- **Check the result:** Inject missing, stale and inconsistent synthetic batches and a healthy control; verify the right failure reason and recovery condition.

## Decision branches

- **When required rule evidence is missing:** Mark the rule unknown and preserve the failed/unknown result rather than changing thresholds to pass.

## Deliver and verify

- Rule-by-rule results, affected counts, severity, and repair/monitoring proposals.
- Rule/version/snapshot/result matrix with counts and likely upstream causes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Stale but complete data fails freshness; missing rule evidence is unknown rather than passing.

## Stop and recover

- Installing monitors or repairing records is separate. Do not redefine thresholds after seeing results to force a pass.

## Example requests

- **Normal (inspect):** Check these records against the supplied freshness and validity rules.
- **edge (inspect):** Evaluate fresh-but-incomplete and complete-but-stale partitions separately.
- **blocked (inspect):** Assess known rules without data access; do not install monitors or invent pass rates.
