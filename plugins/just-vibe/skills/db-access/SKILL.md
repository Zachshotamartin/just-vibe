---
name: db-access
description: "Audit roles, tenant filtering, and row-level policies where supported Use for grants, connection roles and row policies; backend-permissions checks application enforcement."
---

# db-access

Audit roles, tenant filtering, and row-level policies where supported

## Choose this workflow

Use for grants, connection roles and row policies; backend-permissions checks application enforcement.

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
- Trace the actual runtime role and ownership/bypass privileges; inspect read and write predicates with positive and cross-tenant negative cases.

## Decision branches

- **When tests run as an elevated owner/service role:** Do not infer ordinary-user isolation from those results; test the intended execution identity.

## Deliver and verify

- Access findings, policy coverage, and remediation/test proposals.
- Role/resource/action matrix, policy paths and verified/unknown isolation checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A tenant cannot read/update another tenant's rows; privileged service roles are recognized as potential policy bypasses.

## Stop and recover

- No grant/policy changes or real tenant-data probing by default. Unknown execution roles block confident isolation claims.

## Example requests

- **Normal (inspect):** Audit tenant policies and service-role bypass paths from supplied metadata.
- **edge (inspect):** Review row policies where reads are scoped but inserts permit another tenant ID.
- **blocked (inspect):** Inspect policy definitions without probing real tenant data or changing grants.
