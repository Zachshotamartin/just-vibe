---
name: data-incremental
description: "Implement checkpoints, deduplication, and incremental processing Use for replay-safe CDC or watermark processing; data-backfill handles bounded historical ranges."
---

# data-incremental

Implement checkpoints, deduplication, and incremental processing

## Choose this workflow

Use for replay-safe CDC or watermark processing; data-backfill handles bounded historical ranges.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; source change mechanism, stable keys, watermark/checkpoint, late-data policy, and destination semantics.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Incremental updates, deduplication, deletes, and resume behavior.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Define ordering and checkpoint transactions, handle overlap/late arrivals, make replay safe, and test crashes around write/checkpoint boundaries.
- Define event versus arrival order, stable keys, deletions and overlap; persist checkpoints only after durable effects and test both sides of that boundary.

## Decision branches

- **When late updates fall behind the current watermark:** Use an explicit overlap/reconciliation policy rather than silently skipping them.

## Deliver and verify

- Incremental processor with state format and restart evidence.
- Watermark/key protocol and replay, late-update, deletion and crash tests.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Replaying a completed window does not duplicate effects; late updates and deletions follow documented rules.

## Stop and recover

- Do not advance checkpoints before durable output. Missing stable identity or change semantics requires a design decision before implementation.

## Example requests

- **Normal (apply):** Implement checkpointed updates that handle late records and deletion events.
- **edge (apply):** Process late corrections while safely replaying the previous hour.
- **blocked (inspect):** Review incremental design without stable source identity; identify the blocking semantic gap.
