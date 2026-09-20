---
name: db-migrate
description: "Create migrations with compatibility and rollback considerations Use for schema/data transition mechanics; db-schema designs the target model."
---

# db-migrate

Create migrations with compatibility and rollback considerations

## Choose this workflow

Use for schema/data transition mechanics; db-schema designs the target model.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; schema/data change, engine/version, deployment sequence, data volume, and recovery requirements.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Migration design/files when requested; live execution needs the exact environment/action authorization.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect engine/version, migration runner transaction behavior, data shape and old/new application contracts. Record which versions read and write each field during rollout.
- Separate expansion, restartable backfill, validation and contraction. Define lock/downtime bounds, batch identity/checkpoint and interruption handling; estimate impact from evidence rather than row count alone.
- Exercise migration and restart on isolated representative data, including duplicates, nulls and old writers. Verify indexes/constraints are actually valid and semantically match the intended definition; name existence alone is insufficient.
- Define recovery per phase: code rollback, forward repair, and restoration of lost information are different operations. Delay destructive contraction until old readers/writers are retired and the agreed evidence establishes compatibility.
- Use the matching bundled evidence collector when available; read its result and limitations rather than treating exit zero as readiness. Revalidate identity before a dependent action.

## Read when relevant

- Resolving check, deployment or migration identity: [Delivery evidence](../../references/scenarios/delivery-evidence.md).

## Decision branches

- **When a PostgreSQL concurrent index is required:** Use the runner's supported nontransactional path, check invalid indexes after interruption, and never treat name existence alone as proof of a valid matching index.

## Deliver and verify

- Migration plan or files, compatibility evidence, execution conditions, and rollback/forward-recovery limits.
- Phase/SQL-or-runner-step/lock-risk/check/recovery table and compatibility evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Older app versions survive the intended overlap; interruption can resume without duplicated conversion.

## Stop and recover

- Never promise rollback for irreversible data loss. Missing backup/recovery evidence blocks destructive execution.

## Example requests

- **Normal (plan):** Plan splitting full_name while preserving old-version compatibility and source values.
- **edge (plan):** Plan a restartable migration after a concurrent index build left an invalid index.
- **blocked (inspect):** Review a destructive migration with no verified recovery evidence; do not execute it.
