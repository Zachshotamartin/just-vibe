---
name: data-quality
description: "Check freshness, completeness, validity, and consistency"
---

# data-quality

Check freshness, completeness, validity, and consistency

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

## Deliver and verify

- Rule-by-rule results, affected counts, severity, and repair/monitoring proposals.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Stale but complete data fails freshness; missing rule evidence is unknown rather than passing.

## Stop and recover

- Installing monitors or repairing records is separate. Do not redefine thresholds after seeing results to force a pass.

## Example request

Check these records against the supplied freshness and validity rules.
