---
name: data-lineage
description: "Trace field origins and transformations Use to trace a field's origin and transformation; trace follows an execution instance."
---

# data-lineage

Trace field origins and transformations

## Choose this workflow

Use to trace a field's origin and transformation; trace follows an execution instance.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Data engineering methods](../../references/packs/data.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; field/table/report and source/transformation definitions.

data source/version, schema/semantics, transformation code, permitted sampling scope, and storage/compute budget. Prefer aggregates and redacted samples; never upload datasets to external services implicitly. Record time zones and snapshot identity for reproducibility.

Declared evidence requirements: `data.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Origins, transformations, joins, filters, and downstream dependencies for the target data.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace field expressions through jobs/views, identify version and ownership boundaries, record lossy transformations, and mark opaque external steps.
- Follow expressions through joins, filters, aggregations and versioned jobs; record grain changes and lossy transformations at each boundary.

## Technical method

- **Inspect:** Read SQL, transformation code, field mappings, job versions and execution/snapshot metadata.
- **Apply:** Trace each derived field to source fields and transformations, marking dynamic or external edges unresolved.
- **Avoid misdiagnosis:** An import graph or column-name match does not prove runtime provenance.
- **Check the result:** Walk one record and one corrected version through the path and verify the documented transform against actual code and run identity.

## Decision branches

- **When an imported dataset has opaque provenance:** Stop confirmed lineage at that source and request its producer contract rather than assigning an invented origin.

## Deliver and verify

- Field-level lineage graph/table with evidence links and gaps.
- Field-level path with transformations, versions, owners and opaque boundaries.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Derived aggregates include filter/join semantics; an opaque imported table is shown as an unknown boundary rather than assigned invented provenance.

## Stop and recover

- Cap expansion at the requested scope. Documentation-only lineage is labeled separately from code-verified lineage.

## Example requests

- **Normal (inspect):** Trace invoice_total through the transforms and source columns.
- **edge (inspect):** Trace a revenue metric through currency conversion and filtered joins.
- **blocked (inspect):** Map lineage from partial job definitions without upstream access.
