# Backend methods

Find transport entry points, validation, domain rules, transactions and external effects. Keep service ownership explicit and test actual invariants, including failure paths. Use the project's supported provider/framework mechanisms; do not invent crypto or assume authentication supplies resource authorization.

Authorization is an action/resource/owner/tenant matrix enforced server-side on all paths, including exports and jobs. Test positive and negative cases. An ambiguous policy is a decision, not an invitation to choose permissive defaults.

For idempotency, define key scope, payload-conflict behavior, retention and result replay. Align deduplication with durable transactions and external-effect reconciliation. For concurrency, construct the violating interleaving and choose supported atomicity/locking/version checks; process-local locks do not protect multiple workers.

Jobs need payload versions, retry bounds, dead-letter/recovery behavior and checkpoint ownership. Caches need identity-aware keys, invalidation, freshness and source-failure semantics. Retry only safe operations within an end-to-end timeout budget; propagate cancellation, include jitter where appropriate and verify no duplicate effect after partial failure. Live scheduling or fault injection is separate from implementing local code.
