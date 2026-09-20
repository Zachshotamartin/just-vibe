# Data engineering methods

Identify immutable snapshot/version, schema semantics, entity keys, event/ingestion times, timezone and permitted scan budget. Inspect sizes and partitions before scanning. Use aggregate/redacted examples, not raw personal records in reports.

Profiles separate nulls, sentinels, duplicates and legitimate repeated events, and state whether counts are exact or sampled. Contracts define semantic and freshness rules as well as types; thresholds must be supplied or explicitly proposed, never changed to make a check pass.

Pipelines use stable identities, deliberate bad-record policy, staged/atomic partition writes and observable failures. Incremental work includes late arrivals, updates/deletes and crashes between writes and checkpoint advancement. Replays must preserve output invariants; checkpoints advance only after durable results.

Backfills partition bounded work, coordinate with live increments, record code/version and checkpoints, and stop on load/error limits. Reconcile aligned snapshots by keys/values in addition to counts. Lineage includes filters, joins and lossy transformations; opaque external boundaries remain unknown. Do not copy datasets to external services, activate schedules or repair records implicitly.
