# Database methods

Resolve engine/version, exact environment, schema and intended workload before executing anything. Prefer saved schemas/plans and isolated fixtures. A read query can invoke mutating functions, acquire locks or consume substantial resources. EXPLAIN ANALYZE executes the query; reading an existing plan does not authorize it.

Schema work derives cardinality, ownership, nullability and deletion behavior from requirements. Query work checks join multiplicity, null semantics, parameterization and edge results before optimization. Plan analysis separates estimates from actuals and abstract cost units from elapsed time.

Migrations require compatibility across old/new application versions, data volume/lock assessment, restartability and realistic recovery. Use expansion/backfill/contraction when necessary; preserve source data until removal is authorized and validated. Create files and isolated tests separately from live DDL execution.

Indexes follow actual predicates, ordering, selectivity and plans, with write/storage costs and engine-supported rollout behavior. Integrity checks report bounded counts/examples before repair. Lock analysis follows root blockers and transaction boundaries without terminating sessions. Access checks include actual connection roles, write policies, service-role bypass and tenant propagation. Never print connection secrets or production row dumps.
