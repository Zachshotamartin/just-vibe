# architecture worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Place organization invitations in this existing application.

**Evidence:** Membership writes belong to one service; email delivery is asynchronous and duplicate jobs are possible.

**Decision:** Keep invitation ownership with membership and use the existing delivery queue unless an independent deployment requirement is established.

**Useful artifact:** An invitation lifecycle and owner map: create, accept once, expire, retry notification; identify the unique key and transaction boundary.

**Verification to perform:** Walk duplicate acceptance and failed delivery through both current and proposed contracts.

**Misleading case:** Do not propose a new microservice merely because invitation code could fit in its own repository.
