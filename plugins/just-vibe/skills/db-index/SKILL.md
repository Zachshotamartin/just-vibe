---
name: db-index
description: "Recommend indexes based on queries, write costs, and measurements"
---

# db-index

Recommend indexes based on queries, write costs, and measurements

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; actual queries/plans, schema/indexes, write workload, engine, and storage constraints.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Evidence-based index design, redundancy, and rollout; no automatic production DDL.

None by default. Plan artifacts may be saved when requested.

## Execute

- Analyze predicates/order/selectivity, compare existing indexes, estimate write/storage costs from evidence, and design before/after measurement and online-creation strategy where supported.

## Deliver and verify

- Index recommendations or authorized migration with measured validation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Target query improves under comparable conditions; added write cost and redundant indexes are considered.

## Stop and recover

- Do not recommend indexes from column names alone. Unsupported online operations or lock risks must be addressed before execution.

## Example request

Recommend indexes from these query plans, including write and storage costs.
