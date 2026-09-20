# general worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Review this repository, then fix only the first two findings I select.

**Evidence:** The source contains a recorder, cleanup helper and their callers; the worktree also has unrelated edits.

**Decision:** Review current source without requiring a base. Keep stable finding IDs; once the user selects two, carry only those into repair.

**Useful artifact:** A finding cites a reachable input, affected line and consequence. The repair report names the selected IDs, changed files and actual checks.

**Verification to perform:** Reproduce each selected defect with synthetic data; confirm unselected files and pre-existing edits survive.

**Misleading case:** A redaction regex in isolation is not proof: inspect whether its caller applies it to serialized JSON and whether the output is persisted.
