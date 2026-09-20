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

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Tables, relationships, types, constraints, and lifecycle; no live DDL by default.

None by default. Plan artifacts may be saved when requested.

## Execute

- Model ownership/cardinality, encode enforceable invariants, compare access paths, assess nullability/deletion behavior, and plan compatibility with existing data.
- Derive keys/cardinality and deletion rules from explicit invariants, then check null semantics, uniqueness and access paths for the selected engine.

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
