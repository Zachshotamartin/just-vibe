---
name: data-reconcile
description: "Compare source and destination records and explain discrepancies"
---

# data-reconcile

Compare source and destination records and explain discrepancies

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; source/destination snapshots, keys, transformations, tolerances, and comparison budget.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Missing, duplicated, changed, or aggregated discrepancies; no automatic repair.

None by default. Plan artifacts may be saved when requested.

## Execute

- Align snapshots/time windows, compare counts and keyed values, normalize only documented transformations, sample discrepancies safely, and explain likely causes.

## Deliver and verify

- Reconciliation report, discrepancy categories, evidence, and repair candidates.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Equal row counts do not hide different records; allowed rounding/timing differences are distinguished from loss.

## Stop and recover

- Misaligned snapshots prevent a definitive mismatch claim. No row-level data exposure beyond necessary authorized evidence.

## Example request

Compare these aligned snapshots by key, not just row counts.
