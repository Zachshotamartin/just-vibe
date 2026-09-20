---
name: db-schema
description: "Design or review tables, relationships, constraints, and types Use for relational modeling and constraints; db-migrate plans transition of existing data."
---

# db-schema

Design or review tables, relationships, constraints, and types

## Choose this workflow

Use for relational modeling and constraints; db-migrate plans transition of existing data.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; entities, invariants, access patterns, engine, and existing schema.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

- **Infer from evidence:** Read engine/version, ORM/runner, schema and migration history from project artifacts before choosing SQL.
- **Reasonable default:** Prepare local SQL and isolated fixtures without assuming production size, locks or recovery guarantees.
- **Ask only when needed:** Ask for environment, downtime or recovery constraints before live/destructive execution when missing; unavailable production access does not block migration files.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Tables, relationships, types, constraints, and lifecycle; no live DDL by default.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Model ownership/cardinality, encode enforceable invariants, compare access paths, assess nullability/deletion behavior, and plan compatibility with existing data.
2. Derive keys/cardinality and deletion rules from explicit invariants, then check null semantics, uniqueness and access paths for the selected engine.
## Technical method

- **Inspect:** Derive cardinalities, ownership, nullability, units, natural/technical keys and deletion rules from requirements.
- **Method:** Encode durable invariants with supported constraints and types; model money/time precision and tenant-aware uniqueness deliberately.
- **Avoid misdiagnosis:** Application-only uniqueness races under concurrency; nullable columns can alter uniqueness semantics by engine/version.
- **Check the result:** Test boundary values, duplicate keys, orphan writes and delete behavior on the target engine in an isolated database.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Databases worked example](../../references/examples/database.md).


## Decision branches

- **When an optional relationship must still be tenant-consistent:** Consider composite ownership constraints or equivalent enforceable checks rather than trusting a single foreign key.

## Deliver and verify

- Schema proposal, rationale, migration considerations, and representative queries.
- Entity/key/constraint table, deletion semantics and valid/invalid row examples.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Invalid relationships are constrained; expected deletion behavior does not orphan required data.

## Stop and recover

- Do not invent business cardinality or assume another database's semantics. Data ambiguities become explicit decisions.

## Example requests

- **Normal (plan):** Design invoice relationships and deletion behavior against our actual database engine.
- **edge (plan):** Model optional memberships that cannot reference another tenant's organization.
- **blocked (inspect):** Design from requirements without a live database or inventing business cardinality.
