# github worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Prepare a PR for this branch; do not publish it yet.

**Evidence:** Local commits and tests are available, but remote write access is not.

**Decision:** Draft from the actual diff and record the tested SHA. Missing write credentials do not block local preparation.

**Useful artifact:** A PR title/body describing the change, validation and relevant limitations, without agent attribution.

**Verification to perform:** Check the draft against the candidate diff and test evidence; no remote PR should exist as a side effect.

**Misleading case:** Do not interpret the word PR as authorization to create one remotely when the user explicitly requested a draft.
