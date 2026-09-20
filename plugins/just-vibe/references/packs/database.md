# Database methods

Resolve engine/version, exact environment, schema and intended workload before executing anything. Prefer saved schemas/plans and isolated fixtures. A read query can invoke mutating functions, acquire locks or consume substantial resources. EXPLAIN ANALYZE executes the query; reading an existing plan does not authorize it.

Schema work derives cardinality, ownership, nullability and deletion behavior from requirements. Query work checks join multiplicity, null semantics, parameterization and edge results before optimization. Plan analysis separates estimates from actuals and abstract cost units from elapsed time.

Migrations require compatibility across old/new application versions, data volume/lock assessment, restartability and realistic recovery. Use expansion/backfill/contraction when necessary; preserve source data until removal is authorized and validated. Create files and isolated tests separately from live DDL execution.

Indexes follow actual predicates, ordering, selectivity and plans, with write/storage costs and engine-supported rollout behavior. Integrity checks report bounded counts/examples before repair. Lock analysis follows root blockers and transaction boundaries without terminating sessions. Access checks include actual connection roles, write policies, service-role bypass and tenant propagation. Never print connection secrets or production row dumps.

## Applied methods

### Migration decision table

| Context | Method and verification |
|---|---|
| PostgreSQL | Inspect exact DDL and version-specific locking. Even a fast metadata change can need a lock. Concurrent index creation cannot run inside a transaction block; a failed build may leave an invalid index. Inspect validity and definition before reuse. |
| MySQL | Check the exact operation/version's supported online DDL algorithm and lock behavior. Do not translate PostgreSQL syntax or promise a nonblocking change without evidence. |
| SQLite | Check supported ALTER behavior and whether the change needs a table rebuild. Verify copied rows, constraints, indexes and foreign-key behavior on an isolated database. |
| Prisma/Drizzle or another runner | Inspect its migration ledger, generated SQL and transaction wrapping. Separate generating/reviewing migrations from applying them to a live target. Use the installed version's documented commands; do not use development reset/push as a production recovery shortcut. |

[PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html), [CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html).

### Worked transition

For replacing a field used by an older app: add the new representation, deploy compatible writers/readers, backfill with a stable key and restartable predicate, reconcile values, switch readers, then remove the old representation only after all dependent versions are retired. Write a phase table: SQL or runner step, compatible app versions, lock/load consideration, success observation and recovery boundary. A lost source value may make rollback impossible even when code can revert.

Test interruption before and after a committed batch. Resume must not duplicate conversions or advance past uncommitted output. Coordinate backfill with current writers using an explicit conflict policy.

### Query and access fixtures

Before tuning, hand-check a small dataset with two child rows on each of two joins; naive aggregation can multiply results. Include null and empty inputs. Analyze actual versus estimated plan rows without interpreting abstract cost as elapsed time. For row policies, test using the intended application role; owner/service-role bypass can invalidate an apparently successful isolation test.
