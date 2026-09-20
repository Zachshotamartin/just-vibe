# Comparing recorded ML experiments

Use existing exported runs to explain changes, weak slices and identity problems. The bounded runtime supports binary probability classification and regression. Multiclass, ranking, generative metrics, training, large datasets and uncertainty estimation require the relevant project tooling; do not force them into this schema or invent unsupported metrics.

## Import

`experiment import NAME --stdin`:

```json
{"revision":0,"format":"mlflow","exportFile":"experiments/baseline-run.json","predictionsFile":"experiments/baseline-predictions.json","task":"binary","dataset":{"id":"churn-v3","fingerprint":"ACTUAL_DATASET_FINGERPRINT","split":"frozen-test"},"model":"ACTUAL_MODEL_ARTIFACT_ID","codeRevision":"ACTUAL_SOURCE_COMMIT","seed":42,"preprocessing":"pipeline-v2","trainingFeatures":{"age":{"dtype":"float32","transform":"standardizer-v2"}},"servingFeatures":{"age":{"dtype":"float32","transform":"standardizer-v2"}},"threshold":0.5}
```

Inspect export identity, label eligibility, missing cases and the evaluation protocol first. Record actual values and their provenance. Files must be local bounded JSON (8 MiB each), with at most 50,000 prediction rows and 200 slice groups. Keep raw data under the project's existing access/sharing policy. The helper stores hashes/aggregates, not a second copy of prediction rows.

Supported provider exports:

- `json`: `{ "runId": "run-a", "metrics": { "accuracy": 0.9 } }`.
- `mlflow`: the JSON response from [MLflow Get Run](https://mlflow.org/docs/latest/api_reference/rest-api.html#get-run), with `run.info.run_id` and `run.data.metrics` entries containing `key`/`value`.
- `wandb`: an exported [W&B run summary](https://docs.wandb.ai/models/ref/python/experiments/run#property-run-summary) object with numeric metrics; additionally supply `runId` in the import input. Summary files alone do not establish run identity.

No provider login, API mutation, SDK installation, training or deployment occurs. Exports are supplied evidence; dataset/model identities and seed/preprocessing metadata are caller assertions. Export and prediction file hashes are computed from their actual bytes. Reported provider metrics are retained separately from recomputed metrics.

Predictions are a JSON array or `{ "rows": [...] }`:

```json
[{"id":"row-001","target":1,"prediction":0.8,"slices":{"region":"west","device":"mobile"},"predictionTime":"2026-09-01T10:00:00Z","featureAvailableAt":"2026-09-01T09:59:00Z"}]
```

IDs are unique strings; binary targets are 0/1 and predictions probabilities in [0,1]. Regression values must be finite numbers. Slice values are strings; missing dimensions form explicit null groups. Temporal checks require both timestamps or neither; `featureAvailableAt` must represent the latest availability of all features used for that row. Checking only one feature cannot support a no-leakage claim. Training/serving maps record each feature's dtype and transform artifact identity; matching supplied metadata does not execute either preprocessing pipeline.

## Compare and interpret

`experiment show NAME` shows normalized evidence. `experiment compare BASELINE --stdin` takes `candidate` and optional `minSliceSize` (default 20). Input file hashes must still match, task and dataset/split identity must agree, and sorted row IDs, targets and slice memberships must match. Mismatches suppress deltas and rankings. Object-key and row ordering alone do not make equivalent evaluations incomparable.

Binary results include count, accuracy, precision, recall, F1 and confusion counts; undefined denominators produce null. Regression results include count, MAE and RMSE. Results contain overall and per-slice deltas, small-sample indicators, aggregate-versus-slice regressions, feature parity differences, temporal violation counts/coverage and metadata changes. The automatic regression flag uses accuracy for binary tasks and MAE for regression; inspect the declared business metric and all other metric deltas as well.

Identify cases where overall performance improves but a subgroup worsens. Explain denominators and whether threshold, seed, model, code or preprocessing changed. A changed threshold is reported, not silently treated as a causal model improvement. Investigate parity or future-feature violations before recommending deployment. These diagnostics do not automatically disqualify or deploy a model.

The helper does not estimate confidence intervals, causal explanations or statistical significance. Plan an appropriate paired/entity/time-aware uncertainty analysis using the actual project toolchain when required. Supplied rows do not reveal missing/unexported predictions: reconcile counts with the declared evaluation population outside the helper. Keep test-set evaluation separate from tuning and threshold selection.
