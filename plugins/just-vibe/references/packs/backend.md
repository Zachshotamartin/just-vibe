# Backend methods

Find transport entry points, validation, domain rules, transactions and external effects. Keep service ownership explicit and test actual invariants, including failure paths. Use the project's supported provider/framework mechanisms; do not invent crypto or assume authentication supplies resource authorization.

Authorization is an action/resource/owner/tenant matrix enforced server-side on all paths, including exports and jobs. Test positive and negative cases. An ambiguous policy is a decision, not an invitation to choose permissive defaults.

For idempotency, define key scope, payload-conflict behavior, retention and result replay. Align deduplication with durable transactions and external-effect reconciliation. For concurrency, construct the violating interleaving and choose supported atomicity/locking/version checks; process-local locks do not protect multiple workers.

Jobs need payload versions, retry bounds, dead-letter/recovery behavior and checkpoint ownership. Caches need identity-aware keys, invalidation, freshness and source-failure semantics. Retry only safe operations within an end-to-end timeout budget; propagate cancellation, include jitter where appropriate and verify no duplicate effect after partial failure. Live scheduling or fault injection is separate from implementing local code.

## Applied methods

### Idempotency walkthrough

For create-order, scope a client key by tenant and operation and bind it to a normalized payload digest. Use an atomic claim/unique invariant in shared durable storage. Two equal requests should converge on one effect/result; the same key with different payload needs an explicit conflict outcome. A pending record needs an owner/lease/reconciliation policy, not automatic deletion followed by another effect.

If the effect is in the same database, align key/result storage with its transaction. If the effect occurs at an external provider, define supported provider idempotency or a reconciliation path. A timeout between external success and local recording is an uncertain outcome. Test this crash window deliberately with a controlled fake. Do not advertise exactly-once delivery from an in-memory map.

### Concurrency and background work

For two reservations of the last unit, force both operations to read the initial state before either writes. Enforce the invariant using a supported transaction/conditional write/shared lock mechanism, then show that only one valid reservation succeeds. A process-local mutex cannot protect several application processes.

For jobs, distinguish payload version, delivery identity and business-effect identity. Specify claim/lease expiry, acknowledgment, retries and dead-letter behavior. Crash before effect, after effect and before acknowledgment; verify restart preserves the intended business invariant.

### Authentication, cache and resilience

Separate identity proof from resource authorization. Test expired/revoked credentials and cross-tenant direct resource access, including workers and exports.

Cache keys must include the relevant tenant, authorization, filter and representation dimensions. Define invalidation after source changes and behavior during cache failure.

Budget retries within an end-to-end deadline, including nested dependencies. Retry only operations whose effects are safe to repeat or reconcile. Return uncertainty explicitly instead of presenting a fabricated fallback as authoritative business data.
