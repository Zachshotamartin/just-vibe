# Retrieval, ranking and recommendation evaluation

Use when: recommender, ranking metrics, retrieval ranking, ml adoption.

Design or evaluate a recommendation pipeline tied to a product decision and exposure policy.

## Inspect first

- Prediction timestamp, eligibility and label windows
- User/item split, popularity and negative sampling
- Candidate retrieval, ranking features and serving latency

## Method

1. Establish a non-ML baseline and the decision it improves. Split by time and entity where deployment requires unseen users/items.
2. Measure candidate recall separately from ranking quality. Compute ranking metrics on the actual eligible candidate set and disclose sampled-negative bias.
3. Check exposure/position feedback, delayed labels, cold start, diversity and slice performance. Keep online/served feature definitions identical to training.
4. Roll out through offline gates, shadow traffic and bounded experiments with guardrails; distinguish proxy metric gains from measured user outcomes.

## Failure cases

- Future interactions leak into item features.
- Training negatives differ from production candidates.
- An aggregate gain hides a cold-start failure.

## Verification

- Use hand-calculated recall/NDCG examples including ties and no relevant items.
- Assert timestamp boundaries and exclusion rules.
- Document online experiment authority and rollback before deployment.

## Worked scenario

A held-out purchase cannot influence either item popularity or user history at its earlier recommendation timestamp.

## Version-sensitive primary references

- [developers.google.com](https://developers.google.com/machine-learning/recommendation/overview) — Read the official source for the installed version before relying on a version-sensitive API.
- [scikit-learn.org](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ndcg_score.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
