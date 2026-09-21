# PostgreSQL and MySQL query/migration behavior

Use when: postgresql, mysql, database execution plan.

Improve a query or migration using observed plans, locking and deployment constraints.

## Inspect first

- Engine/version, isolation and schema constraints
- Actual plans, cardinality, statistics and parameter distributions
- Migration rollout order, replication and lock budget

## Method

1. Inspect generated SQL and its plan using representative values; separate estimation errors from missing access paths.
2. Define transaction invariants before adding locks. Order lock acquisition consistently and handle deadlock/serialization retries at an idempotent boundary.
3. Plan expand/backfill/validate/contract steps; assess table rewrites, index-build locking and old application compatibility for the actual engine/version.
4. Measure before/after latency and resource use; a covering index trades reads against write/storage costs.

## Failure cases

- A migration takes a table lock longer than the outage budget.
- A new index helps one parameter distribution but harms another.
- A retry repeats a non-idempotent external effect.

## Verification

- Run concurrent fixtures for the invariant being protected.
- Capture actual plans and representative row counts.
- Test rollback/forward repair and mixed-version application behavior.

## Worked scenario

Two concurrent inventory reservations must never reduce available stock below zero, including retries after a deadlock.

## Version-sensitive primary references

- [www.postgresql.org](https://www.postgresql.org/docs/current/using-explain.html) — Read the official source for the installed version before relying on a version-sensitive API.
- [dev.mysql.com](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
