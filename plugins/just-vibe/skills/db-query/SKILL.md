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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan or explain SQL from the desired result and schema; apply for requested query-file repairs and bounded local fixture checks. Live execution needs its resolved environment and scope.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

- **Infer from evidence:** Read engine/version, ORM/runner, schema and migration history from project artifacts before choosing SQL.
- **Reasonable default:** Prepare local SQL and isolated fixtures without assuming production size, locks or recovery guarantees.
- **Ask only when needed:** Ask for environment, downtime or recovery constraints before live/destructive execution when missing; unavailable production access does not block migration files.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Correct SQL/query construction and relevant performance; no broad data repair.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: edit the requested local implementation and perform relevant bounded checks while preserving unrelated work. Live data changes, remote actions and paid jobs require their resolved target and existing session authorization.

## Execute

1. Resolve join cardinality and null semantics, parameterize inputs, inspect result shape, and validate with representative fixtures or bounded authorized reads.
2. Define expected result grain and cardinality, test one-to-many joins and nullable predicates, and compare hand-computed small-fixture results before optimization.
## Technical method

- **Inspect:** Inspect actual schema, parameter binding, join cardinality, null semantics and expected result grain.
- **Method:** Hand-compute a small fixture before optimizing; aggregate each many-side at the correct grain and constrain tenant identity.
- **Avoid misdiagnosis:** Two one-to-many joins can multiply totals; NOT IN with null values can produce unexpected exclusion.
- **Check the result:** Check no rows, nulls, duplicate children, two tenants and boundary predicates against independently calculated results.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Databases worked example](../../references/examples/database.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).

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
- **edge (apply):** Fix the existing query file whose revenue totals are doubled by joining two child collections.
- **blocked (inspect):** Review a query without database access; provide a fixture-based expectation rather than claimed live rows.
