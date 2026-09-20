# ml-evaluation worked example

Illustrative scenario, not a report of executed checks. Adapt its reasoning only when this boundary is present; it does not authorize extra work.

**Request:** Compare two classifiers at our operating threshold.

**Evidence:** Both exports use the same evaluation rows, but one has missing labels for a subgroup and the costs of false negatives are material.

**Decision:** Verify row/target identity and threshold semantics before recomputing metrics; preserve missing-label coverage separately.

**Useful artifact:** Overall and subgroup confusion counts, uncertainty appropriate to the sample, and a conditional recommendation.

**Verification to perform:** Check against a small hand-computable example and a mismatched-row negative control.

**Misleading case:** Better aggregate accuracy does not resolve a harmful subgroup regression or justify tuning repeatedly on the test set.
