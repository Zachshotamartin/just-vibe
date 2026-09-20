# Data engineering methods

Identify immutable snapshot/version, schema semantics, entity keys, event/ingestion times, timezone and permitted scan budget. Inspect sizes and partitions before scanning. Use aggregate/redacted examples, not raw personal records in reports.

Profiles separate nulls, sentinels, duplicates and legitimate repeated events, and state whether counts are exact or sampled. Contracts define semantic and freshness rules as well as types; thresholds must be supplied or explicitly proposed, never changed to make a check pass.

Pipelines use stable identities, deliberate bad-record policy, staged/atomic partition writes and observable failures. Incremental work includes late arrivals, updates/deletes and crashes between writes and checkpoint advancement. Replays must preserve output invariants; checkpoints advance only after durable results.

Backfills partition bounded work, coordinate with live increments, record code/version and checkpoints, and stop on load/error limits. Reconcile aligned snapshots by keys/values in addition to counts. Lineage includes filters, joins and lossy transformations; opaque external boundaries remain unknown. Do not copy datasets to external services, activate schedules or repair records implicitly.

## Applied methods

### Incremental protocol

Define source grain, immutable or versioned record identity, event time, arrival time and deletion semantics. A watermark alone does not explain how late corrections are handled. Specify overlap, deduplication/upsert policy and a periodic reconciliation boundary.

For a batch processor, write output durably before advancing its checkpoint. Rehearse a crash after output write but before checkpoint: replay must be safe. Rehearse a crash before output durability: the checkpoint must not skip missing records. A completion manifest should identify the input snapshot, transformation version, partitions, record counts and rejected records.

### Backfill example

Freeze an explicit historical range. Partition by a stable key/range, estimate volume from metadata or a permitted sample, and test a small bounded batch. If live writers can update the same records, define which version wins and how conflicting changes are reconciled. Store completed partition identities, resource caps and pause reasons. Do not overwrite newer data simply because a historical batch runs later.

### Quality and reconciliation

Align snapshots before comparing counts and keyed values. Equal counts do not imply equal membership: report missing, unexpected, duplicated and mismatched keys separately. Normalize only known transformations such as a specified rounding rule.

Quality rules need declared units, null/sentinel semantics, freshness and thresholds before results are observed. Keep failure, warning and unknown distinct. A missing partition or unreadable sample cannot disappear from the denominator. Lineage records filters, joins and grain changes; a field name alone does not establish origin or meaning.
