---
name: db-explain
description: "Interpret query plans and identify expensive operations Use to interpret an existing or authorized execution plan; db-index proposes an index from workload evidence."
---

# db-explain

Interpret query plans and identify expensive operations

## Choose this workflow

Use to interpret an existing or authorized execution plan; db-index proposes an index from workload evidence.

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
- Read estimated versus actual rows, loop counts, filters, joins, sorting/spilling and buffers using engine-specific meaning; locate the first large estimation divergence.

## Technical method

- **Inspect:** Read engine/version, query bindings, plan format, row estimates, actual counts/loops and available timing.
- **Apply:** Locate the first major estimation or repeated-work divergence and relate it to predicates, statistics and access paths.
- **Avoid misdiagnosis:** Abstract cost is not milliseconds; EXPLAIN ANALYZE executes the statement and may mutate data or consume production resources.
- **Check the result:** Compare plans under equivalent parameters/data and verify unchanged results; without execution permission, report hypotheses from saved plans only.

## Decision branches

- **When only an estimated plan is supplied:** Discuss cost/shape hypotheses without converting cost units into milliseconds or inventing execution statistics.

## Deliver and verify

- Annotated plan, likely causes, and targeted query/index/statistics options.
- Operator evidence, likely bottleneck, discriminating measurement and risk of running it.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Estimated costs are not mislabeled as milliseconds; a row-estimate error is distinguished from a missing index.

## Stop and recover

- EXPLAIN ANALYZE or equivalents execute work and require appropriate authorization. No mutation hidden inside profiling.

## Example requests

- **Normal (inspect):** Interpret this saved query plan without executing EXPLAIN ANALYZE.
- **edge (inspect):** Explain a plan whose nested loop multiplies work through a row-estimate error.
- **blocked (inspect):** Analyze EXPLAIN output without executing EXPLAIN ANALYZE or mutating functions.
