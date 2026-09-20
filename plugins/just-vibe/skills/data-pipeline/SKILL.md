---
name: data-pipeline
description: "Build ingestion or transformation with observable failures Use for a transformation pipeline; data-incremental focuses on checkpoints and change processing."
---

# data-pipeline

Build ingestion or transformation with observable failures

## Choose this workflow

Use for a transformation pipeline; data-incremental focuses on checkpoints and change processing.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; sources, transforms, destination, cadence, correctness criteria, and resource limits.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

- **Infer from evidence:** Inspect schema, source snapshot, transformation code, grain, time zones and permitted sample scope.
- **Reasonable default:** Use bounded synthetic or supplied samples when full data is unavailable; keep unknown values distinct from zero.
- **Ask only when needed:** Resolve ambiguous entity/grain/time semantics before reconciliation or backfill; obtain missing data/compute limits only for the dependent scan or execution.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Ingestion/transformation implementation and isolated validation; activating production schedules requires that request.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Define source identity and keys, validate inputs, implement transformations and atomic/staged writes, expose failures, and test restart and bad-record handling.
2. Establish stable source/output identity, validate transformations with small hand-checked fixtures and stage writes so completion markers follow durable output.
## Technical method

- **Inspect:** Trace source identity, transformations, sink transaction and checkpoint ownership.
- **Method:** Make retries deterministic using stable keys and atomically aligned output/progress where possible; retain failed records with reasons.
- **Avoid misdiagnosis:** Advancing a checkpoint before committing output silently loses records after a crash.
- **Check the result:** Interrupt before/after sink commit, replay a batch and compare outputs to a hand-computed small fixture.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Data engineering worked example](../../references/examples/data.md).


## Decision branches

- **When invalid records can be isolated without corrupting the batch:** Quarantine with counts/reasons under the declared policy; never drop them silently.

## Deliver and verify

- Pipeline, configuration, quality checks, and operational instructions.
- Transform mapping, input/output reconciliation, completion protocol and failure accounting.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A normal batch produces reconciled output; interrupted writes do not masquerade as a completed partition.

## Stop and recover

- No silent row dropping or unrequested data export. Missing semantics block affected transformations rather than guessed conversions.

## Example requests

- **Normal (apply):** Implement isolated ingestion with observable failures and atomic partition writes.
- **edge (apply):** Build a pipeline interrupted between writing data and publishing its manifest.
- **blocked (inspect):** Design transformations with missing field semantics; block only the affected conversions.
