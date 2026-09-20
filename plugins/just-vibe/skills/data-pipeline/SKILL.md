---
name: data-pipeline
description: "Build ingestion or transformation with observable failures"
---

# data-pipeline

Build ingestion or transformation with observable failures

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; sources, transforms, destination, cadence, correctness criteria, and resource limits.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Ingestion/transformation implementation and isolated validation; activating production schedules requires that request.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Define source identity and keys, validate inputs, implement transformations and atomic/staged writes, expose failures, and test restart and bad-record handling.

## Deliver and verify

- Pipeline, configuration, quality checks, and operational instructions.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A normal batch produces reconciled output; interrupted writes do not masquerade as a completed partition.

## Stop and recover

- No silent row dropping or unrequested data export. Missing semantics block affected transformations rather than guessed conversions.

## Example request

Implement isolated ingestion with observable failures and atomic partition writes.
