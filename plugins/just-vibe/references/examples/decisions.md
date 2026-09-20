# decisions worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Choose a job queue for our small team and existing Postgres service.

**Evidence:** Durability is required, load is modest, operators know Postgres, and no broker is already supported.

**Decision:** Compare the current database-backed option with a broker against actual durability and operating needs. Make the recommendation conditional on measured lock/latency limits.

**Useful artifact:** A recommendation with a decisive constraint and a revisit trigger, such as sustained queue delay beyond the agreed objective.

**Verification to perform:** Check that the option preserves retries and recovery under the stated workload; mark unmeasured capacity explicitly.

**Misleading case:** Do not turn missing cost weights into invented numerical scores or require a long questionnaire before making a useful conditional choice.
