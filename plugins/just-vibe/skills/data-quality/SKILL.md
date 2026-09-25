---
name: data-quality
description: "Check freshness, completeness, validity, and consistency. Use to evaluate an identified snapshot against declared rules; data-profile discovers descriptive anomalies, data-pipeline embeds checks and ops-observability or ops-alerts implement monitoring."
---

# data-quality

Check freshness, completeness, validity, and consistency.

## Choose this workflow

Use to evaluate an identified snapshot against declared rules; data-profile discovers descriptive anomalies, data-pipeline embeds checks and ops-observability or ops-alerts implement monitoring.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; dataset, quality contract, thresholds, time window, and bounded execution access.

**Pack prerequisites:** Data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

- **Infer from evidence:** Inspect schema, source snapshot, transformation code, grain, time zones and permitted sample scope.
- **Reasonable default:** Use bounded synthetic or supplied samples when full data is unavailable; keep unknown values distinct from zero.
- **Ask only when needed:** Resolve ambiguous entity/grain/time semantics before reconciliation or backfill; obtain missing data/compute limits only for the dependent scan or execution.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Freshness, completeness, validity, uniqueness, and cross-field consistency.

No source changes in inspect/plan. Save only requested planning artifacts. data-pipeline embeds accepted checks, ops-observability or ops-alerts implement monitoring and data-backfill repairs records.

## Execute

1. Resolve the applicable rules and freeze their thresholds before observing results.
2. Evaluate completeness, freshness and validity separately against the identified snapshot, counting excluded or unreadable records and separating warnings from failures.
3. Compare with history where available and identify likely upstream causes.

## Technical method

- **Inspect:** Resolve completeness, freshness, validity and consistency rules with denominators and consumer impact.
- **Method:** Separate no data from valid zero volume; define late-arrival windows and missing-check behavior.
- **Avoid misdiagnosis:** A green dashboard can reflect a query that stopped receiving rows rather than healthy data.
- **Check the result:** Inject missing, stale and inconsistent synthetic batches and a healthy control; verify the right failure reason and recovery condition.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Data engineering worked example](../../references/examples/data.md).


## Decision branches

- **When required rule evidence is missing:** Mark the rule unknown and preserve the failed/unknown result rather than changing thresholds to pass.

## Deliver and verify

- Rule/version/snapshot/result matrix with affected counts, severity, likely upstream causes and repair or monitoring proposals.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Stale but complete data fails freshness; missing rule evidence is unknown rather than passing.

## Stop and recover

- Installing monitors (data-pipeline, ops-observability, ops-alerts) or repairing records (data-backfill) is separate. Do not redefine thresholds after seeing results to force a pass.

## Example requests

- **Normal (inspect):** Check these records against the supplied freshness and validity rules.
- **Edge (inspect):** Evaluate fresh-but-incomplete and complete-but-stale partitions separately.
- **Blocked (inspect):** Assess known rules without data access; do not install monitors or invent pass rates.
