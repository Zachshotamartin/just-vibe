# operations worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Investigate elevated errors; do not restart anything.

**Evidence:** Errors begin at a particular deployment, but upstream timeouts and local saturation are both plausible.

**Decision:** Correlate bounded telemetry across the same revision/time window and identify the smallest observation separating the hypotheses.

**Useful artifact:** A timeline, ranked causal hypotheses and a scoped proposed intervention with a recovery check.

**Verification to perform:** Compare unaffected traffic and pre-deployment behavior; distinguish missing telemetry from evidence of no failures.

**Misleading case:** A restart reducing errors does not establish root cause or authorize restarting other services.
