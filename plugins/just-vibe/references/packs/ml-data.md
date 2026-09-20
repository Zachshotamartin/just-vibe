# ML data methods

Write the unit of analysis, target, prediction moment, label horizon, available information and intended decision before touching features or algorithms. Distinguish the real objective from a convenient proxy; a rule-based solution may be sufficient.

Audit collection, eligibility, follow-up, censoring, annotation policy and missing-label mechanisms. Unobserved outcomes are not automatically negative. Describe population coverage and selection bias; more rows do not establish representativeness.

Splits follow deployment-time and entity/group dependencies. Check shared entities, overlapping windows, duplicates, label maturation and point-in-time joins. Fit preprocessors only on training partitions. Track every suspicious feature back to when it becomes available. If leakage invalidates results, explicitly require re-evaluation rather than preserving old scores.

Separate measured overlap from inferred dependence. Matching timestamps or labels do not prove two rows share one outcome event; overlapping window metadata does not establish identical sensor values without raw observations. Describe those as risks until provenance resolves them. Choose group and temporal boundaries against the deployment question: predicting future observations for known machines differs from generalizing to unseen machines or production lines. If deployment is unspecified, explain the alternatives instead of declaring one split universally mandatory. A correlation in a tiny supplied sample is not proof of population-wide predictive behavior, and no model score exists unless results were actually supplied or measured.

Features need stable semantics, missing/unseen-category behavior and training/serving parity. Sampling/weighting belongs within training folds; altered class prevalence changes probability interpretation. Keep test data out of feature and threshold selection. Version manifests record data identity, transforms, code and splits without copying confidential raw data into Git.
