---
name: db-locks
description: "Investigate blocking, deadlocks, long transactions, and contention Use for transaction blocking/deadlock diagnosis; backend-concurrency designs application consistency."
---

# db-locks

Investigate blocking, deadlocks, long transactions, and contention

## Choose this workflow

Use for transaction blocking/deadlock diagnosis; backend-concurrency designs application consistency.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Databases methods](../../references/packs/database.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; engine, time window, affected workload, and lock/session metadata.

actual engine/version, schema/migrations, query workload, and explicitly identified environment. Prefer supplied plans, metadata, and isolated fixtures. Even a SELECT can lock, call mutating functions, or overload a database; inspect semantics before execution. Executing an analyzed query is distinct from reading its plan.

Declared evidence requirements: `database.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Blocking chains, deadlocks, transaction duration, and contention causes.

None by default. Plan artifacts may be saved when requested.

## Execute

- Correlate blocked/blocking sessions and queries, inspect transaction boundaries, distinguish transient waits from persistent contention, and propose targeted remedies.
- Correlate wait and blocker snapshots with transaction age, query identity and application transaction boundaries; follow the root blocker rather than the noisiest victim.

## Decision branches

- **When the reported deadlock already resolved:** Separate historical deadlock analysis from current blocking and avoid terminating unrelated live sessions.

## Deliver and verify

- Blocking graph/timeline, likely cause, and safe operational/code options.
- Blocking chain, snapshot time, transaction boundary and targeted remedy.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The root blocker is distinguished from downstream victims; a completed deadlock is not confused with current blocking.

## Stop and recover

- No session termination, transaction cancellation, or timeout changes implicitly. Redact sensitive query parameters and acknowledge snapshot limitations.

## Example requests

- **Normal (inspect):** Explain the blocking chain from these session and lock snapshots.
- **edge (inspect):** Diagnose an idle transaction blocking several otherwise fast updates.
- **blocked (inspect):** Analyze a saved lock snapshot without cancelling sessions or changing timeouts.
