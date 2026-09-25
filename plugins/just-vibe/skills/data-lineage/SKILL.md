---
name: data-lineage
description: "Trace field origins and transformations. Use to find where a field or metric comes from across transformations; trace follows one execution instance."
---

# data-lineage

Trace field origins and transformations.

## Choose this workflow

Use to find where a field or metric comes from across transformations; trace follows one execution instance.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; field/table/report and source/transformation definitions.

**Pack prerequisites:** Data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

- **Infer from evidence:** Inspect schema, source snapshot, transformation code, grain, time zones and permitted sample scope.
- **Reasonable default:** Use bounded synthetic or supplied samples when full data is unavailable; keep unknown values distinct from zero.
- **Ask only when needed:** Resolve ambiguous entity/grain/time semantics before reconciliation or backfill; obtain missing data/compute limits only for the dependent scan or execution.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Origins, transformations, joins, filters, and downstream dependencies for the target data.

No source changes in inspect/plan. Save only requested planning artifacts. data-pipeline or fix applies an accepted change.

## Execute

1. Follow field expressions through jobs, views, joins, filters, aggregations and versioned jobs.
2. Record grain changes, lossy transformations, versions and ownership at each boundary, and mark opaque external steps.

## Technical method

- **Inspect:** Read SQL, transformation code, field mappings, job versions and execution/snapshot metadata.
- **Method:** Trace each derived field to source fields and transformations, marking dynamic or external edges unresolved.
- **Avoid misdiagnosis:** An import graph or column-name match does not prove runtime provenance.
- **Check the result:** Walk one record and one corrected version through the path and verify the documented transform against actual code and run identity.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Data engineering worked example](../../references/examples/data.md).


## Decision branches

- **When an imported dataset has opaque provenance:** Stop confirmed lineage at that source and request its producer contract rather than assigning an invented origin.

## Deliver and verify

- Field-level lineage graph or table with transformations, versions, owners, evidence links, opaque boundaries and gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Derived aggregates include filter/join semantics; an opaque imported table is shown as an unknown boundary rather than assigned invented provenance.

## Stop and recover

- Cap expansion at the requested scope. Documentation-only lineage is labeled separately from code-verified lineage.

## Example requests

- **Normal (inspect):** Trace invoice_total through the transforms and source columns.
- **Edge (inspect):** Trace a revenue metric through currency conversion and filtered joins.
- **Blocked (inspect):** Map lineage from partial job definitions without upstream access.
