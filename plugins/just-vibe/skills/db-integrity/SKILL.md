---
name: db-integrity
description: "Find orphaned records, invalid relationships, and missing constraints Use to check declared invariants in existing data; db-access checks permission policy."
---

# db-integrity

Find orphaned records, invalid relationships, and missing constraints

## Choose this workflow

Use to check declared invariants in existing data; db-access checks permission policy.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; invariants, schema, data scope, and bounded read permission.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Orphans, duplicates, invalid relationships, and constraint gaps; no automatic deletion or repair.

None by default. Plan artifacts may be saved when requested.

## Execute

- Translate invariants into safe checks, estimate query impact, inspect redacted aggregate/sample evidence, distinguish historical exceptions, and propose prevention/repair.
- Translate each invariant into bounded counts and redacted examples; distinguish nullable relationships, historical exceptions and actual orphan/duplicate conditions.

## Decision branches

- **When data violates an ambiguous business rule:** Report the evidence and policy question before proposing deletion or repair.

## Deliver and verify

- Integrity findings with counts, scoped examples, and repair options.
- Invariant/check/snapshot/count table and preventive constraint or repair option.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A true orphan is detected; legitimate nullable relationships are not classified as corruption.

## Stop and recover

- Ambiguous business rules prevent destructive recommendations. Large scans need a budget and appropriate execution environment.

## Example requests

- **Normal (inspect):** Audit orphaned invoice records with bounded read-only checks.
- **edge (inspect):** Check duplicate business keys while retaining legitimate archived duplicates.
- **blocked (inspect):** Plan integrity checks on a large table without scan authorization or production row dumps.
