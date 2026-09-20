# api worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Add cursor pagination while preserving existing clients.

**Evidence:** The current API sorts by creation time, ties occur, and older consumers depend on a stable response shape.

**Decision:** Use a deterministic tie-breaker and define cursor semantics under insertions before changing the public contract.

**Useful artifact:** An updated schema, compatible response and producer/consumer examples.

**Verification to perform:** Paginate tied rows without omissions or duplicates and exercise old clients.

**Misleading case:** Base64 encoding an offset does not make pagination stable under concurrent inserts.
