# testing worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Add a regression test for the discount bug.

**Evidence:** An absent discount and a zero-valued discount have different meanings; the current implementation conflates them.

**Decision:** Derive the expected results from the contract, then show the regression reaches the wrong behavior in the original implementation.

**Useful artifact:** A focused test with valid neighboring cases and the exact failing assertion.

**Verification to perform:** The seeded defect must fail the behavioral assertion; both corrected behavior and legitimate zero/empty inputs must pass.

**Misleading case:** A missing module or syntax error in setup does not establish sensitivity to the discount defect.
