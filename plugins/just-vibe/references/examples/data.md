# data worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Reconcile yesterday’s transactions between two exports.

**Evidence:** One source is event-grain, one is order-grain; timestamps use different zones and some cancellations arrive late.

**Decision:** Normalize grain and observation window before comparing totals; keep missing and zero amounts distinct.

**Useful artifact:** An attributed reconciliation table with matched, missing, duplicate and unresolved groups.

**Verification to perform:** Use known duplicate and late-arrival controls; retain aggregate denominators and source snapshot identities.

**Misleading case:** Equal grand totals can conceal offsetting duplicates and missing records.
