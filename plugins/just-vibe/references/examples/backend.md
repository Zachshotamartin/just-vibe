# backend worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Make order creation safe under retries.

**Evidence:** A payment operation and durable order record can partially succeed; the client may retry after a timeout.

**Decision:** Define idempotency identity, transactional ownership and reconciliation of uncertain payment results.

**Useful artifact:** A state transition and storage contract with local duplicate/concurrency tests.

**Verification to perform:** Submit concurrent equal keys and simulate failure after the external effect but before response.

**Misleading case:** Returning the cached response for any reused key hides conflicting payloads; compare semantic request identity.
