---
name: data-incremental
description: "Implement checkpoints, deduplication, and incremental processing"
---

# data-incremental

Implement checkpoints, deduplication, and incremental processing

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

## Deliver and verify

- Incremental processor with state format and restart evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Replaying a completed window does not duplicate effects; late updates and deletions follow documented rules.

## Stop and recover

- Do not advance checkpoints before durable output. Missing stable identity or change semantics requires a design decision before implementation.

## Example request

Implement checkpointed updates that handle late records and deletion events.
