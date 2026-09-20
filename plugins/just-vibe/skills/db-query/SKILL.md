---
name: db-query
description: "Write or repair queries against the actual schema Use for correct query semantics; db-explain analyzes the execution plan afterward."
---

# db-query

Write or repair queries against the actual schema

## Choose this workflow

Use for correct query semantics; db-explain analyzes the execution plan afterward.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; desired result, schema, engine, parameters, and scale. Explicit query execution selects the authorized mode/environment.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Correct SQL/query construction and relevant performance; no broad data repair.

None by default. Plan artifacts may be saved when requested.

## Execute

- Resolve join cardinality and null semantics, parameterize inputs, inspect result shape, and validate with representative fixtures or bounded authorized reads.
- Define expected result grain and cardinality, test one-to-many joins and nullable predicates, and compare hand-computed small-fixture results before optimization.

## Technical method

- **Inspect:** Inspect actual schema, parameter binding, join cardinality, null semantics and expected result grain.
- **Apply:** Hand-compute a small fixture before optimizing; aggregate each many-side at the correct grain and constrain tenant identity.
- **Avoid misdiagnosis:** Two one-to-many joins can multiply totals; NOT IN with null values can produce unexpected exclusion.
- **Check the result:** Check no rows, nulls, duplicate children, two tenants and boundary predicates against independently calculated results.

## Decision branches

- **When joins multiply rows before aggregation:** Preaggregate or change the join while preserving semantics; DISTINCT is not a universal repair.

## Deliver and verify

- Query, assumptions, expected results, and verification evidence.
- Parameterized query, expected row grain and empty/null/duplicate-boundary checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- One-to-many joins do not silently inflate aggregates; empty/null inputs yield the intended behavior.

## Stop and recover

- Writes need explicit scope and affected-row checks. Do not run unbounded expensive queries against production for convenience.

## Example requests

- **Normal (plan):** Write a query for invoice totals without multiplying values through one-to-many joins.
- **edge (plan):** Fix revenue totals doubled by joining two child collections.
- **blocked (inspect):** Review a query without database access; provide a fixture-based expectation rather than claimed live rows.
