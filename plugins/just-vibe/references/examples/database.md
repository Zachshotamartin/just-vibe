# database worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Write a migration splitting full_name; do not run it on production.

**Evidence:** Old writers still write full_name, a backfill may be interrupted, and the migration runner wraps steps in transactions.

**Decision:** Prepare expansion and resumable backfill first; retain source values and delay contraction until compatibility is established.

**Useful artifact:** Migration files plus phase-specific compatibility, check and recovery instructions.

**Verification to perform:** Use isolated representative rows including nulls, duplicates and an old-writer update during backfill.

**Misleading case:** A down migration cannot reconstruct discarded names; an index name alone does not prove a valid index.
