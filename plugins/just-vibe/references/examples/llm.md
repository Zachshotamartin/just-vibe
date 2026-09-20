# llm worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Add a tool for looking up an order.

**Evidence:** Tool arguments come from model output; tenant identity comes from the authenticated application and must not be overridden.

**Decision:** Validate argument shape and authorize the lookup against the server-owned tenant before accessing storage.

**Useful artifact:** A bounded tool schema, handler and tests using synthetic orders.

**Verification to perform:** Test a valid lookup, malformed arguments and another tenant’s order; distinguish mocked contracts from model performance.

**Misleading case:** A schema-valid order ID is not evidence that the requesting user may access that order.
