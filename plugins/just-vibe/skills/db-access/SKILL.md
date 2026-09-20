---
name: db-access
description: "Audit roles, tenant filtering, and row-level policies where supported"
---

# db-access

Audit roles, tenant filtering, and row-level policies where supported

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; roles, tenant model, policies, engine, and representative access matrix.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Database privileges, tenant predicates, row-level policies, and bypass paths.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect grants and execution identities, trace connection-role behavior, evaluate policies including writes, and design or run authorized isolated access checks.

## Deliver and verify

- Access findings, policy coverage, and remediation/test proposals.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A tenant cannot read/update another tenant's rows; privileged service roles are recognized as potential policy bypasses.

## Stop and recover

- No grant/policy changes or real tenant-data probing by default. Unknown execution roles block confident isolation claims.

## Example request

Audit tenant policies and service-role bypass paths from supplied metadata.
