# react worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Fix search results switching back to an older query.

**Evidence:** Two requests overlap; the older request can resolve or reject after the newer one.

**Decision:** Tie result and error commits to the active request generation and preserve cancellation ownership.

**Useful artifact:** A focused state/lifecycle patch with tests for stale success, stale error and unmount.

**Verification to perform:** Resolve requests out of order and confirm only the active request changes visible state.

**Misleading case:** Adding a dependency to an effect is not enough if the earlier promise still commits its error.
