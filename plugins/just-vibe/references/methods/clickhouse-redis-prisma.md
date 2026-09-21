# ClickHouse, Redis and Prisma semantics

Use when: clickhouse, redis, prisma.

Change an engine/ORM-specific data path without assuming relational/cache behaviors are interchangeable.

## Inspect first

- ClickHouse table/order/partition keys and mutation model
- Redis expiry, eviction, persistence and cluster keys
- Prisma schema, generated client and migration history

## Method

1. For ClickHouse, choose order/partition keys from actual filtering and cardinality; inspect scanned rows and merge pressure, and do not promise immediate mutation semantics without verifying the engine.
2. For Redis, define what happens on cache miss, eviction and stale data. Use atomic operations or scripts for multi-step invariants and bounded TTL/size policies.
3. For Prisma, inspect the actual SQL and relation loading, parameterize raw queries, and test database-enforced constraints under concurrency.
4. Separate backfills, cache rebuilds and schema changes into bounded resumable operations with explicit progress and failure handling.

## Failure cases

- Redis eviction removes correctness-critical state.
- A Prisma read-then-write race bypasses application-only validation.
- A ClickHouse mutation is treated as immediate row-level transactional behavior.

## Verification

- Test cache loss and a duplicate/concurrent write.
- Inspect query plans and generated SQL on the actual engine.
- Measure backfill resource usage and restart recovery.

## Worked scenario

A rate limit must remain atomic under parallel requests; separate GET and SET calls are not sufficient.

## Version-sensitive primary references

- [clickhouse.com](https://clickhouse.com/docs/optimize/query-optimization) — Read the official source for the installed version before relying on a version-sensitive API.
- [redis.io](https://redis.io/docs/latest/develop/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.prisma.io](https://www.prisma.io/docs/orm/prisma-client/queries/transactions) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
