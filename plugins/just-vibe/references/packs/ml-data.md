# ML data methods

Write the unit of analysis, target, prediction moment, label horizon, available information and intended decision before touching features or algorithms. Distinguish the real objective from a convenient proxy; a rule-based solution may be sufficient.

Audit collection, eligibility, follow-up, censoring, annotation policy and missing-label mechanisms. Unobserved outcomes are not automatically negative. Describe population coverage and selection bias; more rows do not establish representativeness.

Splits follow deployment-time and entity/group dependencies. Check shared entities, overlapping windows, duplicates, label maturation and point-in-time joins. Fit preprocessors only on training partitions. Track every suspicious feature back to when it becomes available. If leakage invalidates results, explicitly require re-evaluation rather than preserving old scores.

Separate measured overlap from inferred dependence. Matching timestamps or labels do not prove two rows share one outcome event; overlapping window metadata does not establish identical sensor values without raw observations. Describe those as risks until provenance resolves them. Choose group and temporal boundaries against the deployment question: predicting future observations for known machines differs from generalizing to unseen machines or production lines. If deployment is unspecified, explain the alternatives instead of declaring one split universally mandatory. A correlation in a tiny supplied sample is not proof of population-wide predictive behavior, and no model score exists unless results were actually supplied or measured.

Features need stable semantics, missing/unseen-category behavior and training/serving parity. Sampling/weighting belongs within training folds; altered class prevalence changes probability interpretation. Keep test data out of feature and threshold selection. Version manifests record data identity, transforms, code and splits without copying confidential raw data into Git.

## Applied methods

### Prediction contract

Record entity, row grain, prediction timestamp, feature availability timestamps, outcome interval, label availability and simulated model-fit time. A row's event time and the time its information becomes available can differ. Missing follow-up is not a negative label.

### Split example

A machine has overlapping feature windows. If deployment predicts future behavior on known machines, time-respecting evaluation answers a different question from holding out entire machines. If deployment targets unseen machines, group separation becomes relevant. State which question each split answers; do not universally require one split type.

Derive purge or gap needs from actual information and outcome overlap under that question. Window metadata alone does not prove identical sensor measurements, shared failure events or a universal required embargo. Unknown event IDs and transformation fit history stay unknown. Name exactly which evaluation assumptions a confirmed issue invalidates.

### Feature pipeline

In a scikit-learn-style workflow, split before learning preprocessing parameters. Put learned preprocessing and the estimator in a pipeline so cross-validation refits preprocessing within each training fold. Test unseen categories and missing values through the same inference transformation contract. [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html).

### Leakage report template

Observation and source/rows; prediction/fit-time assumption; confirmed defect, conditional risk or missing evidence; affected evaluation; correction or next evidence. Before delivery, verify every definite statement is established by the cited artifact. Do not convert cautious recommendations into proven facts or claim every score is invalid when only a particular historical simulation is affected.

### Versioned historical feature example

An event first appears inside a feature window, then a correction moves its event timestamp outside that window. At a prediction after the correction became available, choose the latest visible version first and then apply the window. Filtering event versions by the window before choosing a version incorrectly resurrects the old record. A correction arriving after the prediction must not change that historical feature at all.

Write separate event, availability and revision-order fields, the entity/event identity, duplicate policy and exact window endpoints. Compare timezone-aware instants, not lexical timestamp order; explicitly reject or resolve naive timestamps according to the source contract. Test the lower and upper boundaries, late arrivals, moved revisions, tied availability with revision ordering, duplicate versions, cross-entity IDs and valid negative/zero values. State unresolved tie/conflict policy when the source cannot order contradictory versions.

### Training eligibility before preprocessing

A row predicted before the training cutoff can still have an outcome that became known only afterward. Decide eligibility against the simulated model-fit time and available snapshot before fitting any scaler, vocabulary, imputer or sampler. Held-out rows with unknown outcomes may remain useful for inference coverage while being excluded from labeled metrics. Report both row and labeled-row counts; never turn unknown into a negative or drop a legitimate zero label through truthiness.

Use a tiny independently calculated example to check fit membership and transformation values. Verify no eligible training rows, constant training values, future observations, exact split endpoints and input immutability. A fallback for empty training is a documented pipeline behavior, not permission to fit on held-out rows. Keep known-entity forecasting and unseen-entity generalization as distinct questions.
