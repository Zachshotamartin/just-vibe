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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan a migration when planning is requested; apply for requested migration files and isolated compatibility checks. Applying to a live database requires its exact environment, rollout and recovery constraints.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

- **Infer from evidence:** Read engine/version, ORM/runner, schema and migration history from project artifacts before choosing SQL.
- **Reasonable default:** Prepare local SQL and isolated fixtures without assuming production size, locks or recovery guarantees.
- **Ask only when needed:** Ask for environment, downtime or recovery constraints before live/destructive execution when missing; unavailable production access does not block migration files.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Migration design/files when requested; live execution needs the exact environment/action authorization.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Inspect engine/version, migration runner transaction behavior, data shape and old/new application contracts. Record which versions read and write each field during rollout.
2. Separate expansion, restartable backfill, validation and contraction. Define lock/downtime bounds, batch identity/checkpoint and interruption handling; estimate impact from evidence rather than row count alone.
3. Exercise migration and restart on isolated representative data, including duplicates, nulls and old writers. Verify indexes/constraints are actually valid and semantically match the intended definition; name existence alone is insufficient.
4. Define recovery per phase: code rollback, forward repair, and restoration of lost information are different operations. Delay destructive contraction until old readers/writers are retired and the agreed evidence establishes compatibility.
5. Use the matching bundled evidence collector when available; read its result and limitations rather than treating exit zero as readiness. Revalidate identity before a dependent action.
## Technical method

- **Inspect:** Read generated SQL, migration ledger, engine/version, data volume, locks and active application versions.
- **Method:** Plan expansion/backfill/switch/contraction where needed; define idempotent resume and recovery at each irreversible step.
- **Avoid misdiagnosis:** ORM migration generation does not establish safe production locking; a down migration cannot recreate discarded values.
- **Check the result:** Apply to a representative isolated schema/data copy, interrupt a batch, resume and check compatibility with both application versions.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Databases worked example](../../references/examples/database.md).
- Resolving check, deployment or migration identity: [Delivery evidence](../../references/scenarios/delivery-evidence.md).

## Decision branches

- **When a PostgreSQL concurrent index is required:** Use the runner's supported nontransactional path, check invalid indexes after interruption, and never treat name existence alone as proof of a valid matching index.
- **When the request is for local preparation or implementation:** Write the requested migration and compatibility checks using observed engine/runner conventions; identify missing deployment or recovery evidence before applying to a live database.

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
