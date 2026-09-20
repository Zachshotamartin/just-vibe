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

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Machine-checkable and semantic obligations across a data boundary.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify required fields and keys, define ranges/nullability/time semantics, set freshness expectations, and specify versioning and violation handling.
- Specify grain, keys, types, units, nullability, event/arrival time, freshness and allowed schema evolution from actual consumption paths.

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
