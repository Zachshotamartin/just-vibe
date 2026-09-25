---
name: data-contract
description: "Define schema, semantics, freshness, and quality constraints Use to define producer/consumer data expectations; data-quality checks an accepted contract."
---

# data-contract

Define schema, semantics, freshness, and quality constraints

## Choose this workflow

Use to define producer/consumer data expectations; data-quality checks an accepted contract.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; producer/consumer needs, schema, field meaning, freshness, and quality requirements.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

- **Infer from evidence:** Inspect schema, source snapshot, transformation code, grain, time zones and permitted sample scope.
- **Reasonable default:** Use bounded synthetic or supplied samples when full data is unavailable; keep unknown values distinct from zero.
- **Ask only when needed:** Resolve ambiguous entity/grain/time semantics before reconciliation or backfill; obtain missing data/compute limits only for the dependent scan or execution.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Machine-checkable and semantic obligations across a data boundary.

No source changes in inspect/plan. Save only requested planning artifacts. data-pipeline or fix applies an accepted change.

## Execute

1. Identify required fields and keys, define ranges/nullability/time semantics, set freshness expectations, and specify versioning and violation handling.
2. Specify grain, keys, types, units, nullability, event/arrival time, freshness and allowed schema evolution from actual consumption paths.
## Technical method

- **Inspect:** Identify producer/consumer schema, semantic units, key uniqueness, timeliness and allowed evolution.
- **Method:** Specify compatibility and quarantine behavior for missing, late, duplicate and newly introduced values.
- **Avoid misdiagnosis:** Type-valid data can still be wrong in units, timezone or row grain.
- **Check the result:** Test valid, structurally invalid and semantically wrong records plus a compatible schema evolution with real consumer decoding.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Data engineering worked example](../../references/examples/data.md).


## Decision branches

- **When thresholds or ownership have not been agreed:** Mark them proposed with rationale and name the decision needed before enforcement.

## Deliver and verify

- Data contract, examples, validation rules, and ownership questions.
- Versioned field/rule/response contract with accepted and rejected examples.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Syntactically valid but semantically invalid values can fail; an additive schema change has defined compatibility behavior.

## Stop and recover

- Do not invent quality thresholds or ownership agreement. Unresolved thresholds remain proposed values with rationale.

## Example requests

- **Normal (plan):** Define schema, event-time semantics, freshness, and violation handling for orders.
- **edge (plan):** Define a contract for late-arriving corrections and optional new fields.
- **blocked (inspect):** Draft a contract without agreed freshness thresholds; do not invent producer commitments.
