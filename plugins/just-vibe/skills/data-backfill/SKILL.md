---
name: data-backfill
description: "Plan or run resumable historical-data backfills"
---

# data-backfill

Plan or run resumable historical-data backfills

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; historical range, transformation/version, target, batch limits, and load budget.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Resumable historical recomputation; execution requires the specified data/environment authorization.

None by default. Plan artifacts may be saved when requested.

## Execute

- Estimate volume, partition work, define idempotent writes and checkpoints, validate a small authorized batch, reconcile output, and resume within limits.

## Deliver and verify

- Backfill plan/script or run record with progress, discrepancies, and recovery steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Restart skips or safely replays completed batches; live incremental processing does not race into inconsistent output.

## Stop and recover

- Pause on load/error thresholds. Never launch an unbounded production scan or overwrite historical data without explicit scope.

## Example request

Plan a resumable one-year backfill with explicit batch and load limits.
