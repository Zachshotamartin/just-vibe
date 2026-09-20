---
name: db-explain
description: "Interpret query plans and identify expensive operations"
---

# db-explain

Interpret query plans and identify expensive operations

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; query, engine/version, saved execution plan, and workload context.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Plan interpretation, estimates, scans, joins, sorting, and evidence-supported bottlenecks.

None by default. Plan artifacts may be saved when requested.

## Execute

- Read operators and row estimates, compare actuals when supplied, identify cardinality errors and costly stages, and propose discriminating measurements.

## Deliver and verify

- Annotated plan, likely causes, and targeted query/index/statistics options.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Estimated costs are not mislabeled as milliseconds; a row-estimate error is distinguished from a missing index.

## Stop and recover

- EXPLAIN ANALYZE or equivalents execute work and require appropriate authorization. No mutation hidden inside profiling.

## Example request

Interpret this saved query plan without executing EXPLAIN ANALYZE.
