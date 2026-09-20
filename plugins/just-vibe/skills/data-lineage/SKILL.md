---
name: data-lineage
description: "Trace field origins and transformations"
---

# data-lineage

Trace field origins and transformations

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

## Deliver and verify

- Field-level lineage graph/table with evidence links and gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Derived aggregates include filter/join semantics; an opaque imported table is shown as an unknown boundary rather than assigned invented provenance.

## Stop and recover

- Cap expansion at the requested scope. Documentation-only lineage is labeled separately from code-verified lineage.

## Example request

Trace invoice_total through the transforms and source columns.
