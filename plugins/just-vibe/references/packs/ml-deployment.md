# ML deployment methods

Resolve model, preprocessing, feature order, schema, dependency and runtime versions. Check artifact provenance before loading formats that can execute code. Package all inference requirements together and test known inputs in a fresh supported environment; do not include training data or credentials unnecessarily.

Serving validates input shape/types and resource limits, reports readiness only after the intended model loads, and exposes safe operational errors. Batch inference uses stable output keys, partitions, model-version labels and durable checkpointed writes; account for every invalid/failed record.

Parity compares identical raw inputs through each transformation boundary and locates the first divergence. Separate numerical tolerance from different semantics/versions. Performance separates cold/warm paths and measures latency distributions, throughput and memory under declared workloads; optimization includes a quality comparison.

Drift needs aligned baseline/current windows, sample-size and seasonal context. Distribution change alone does not prove quality loss. Monitoring separates leading operational signals from delayed outcome labels. Canary/shadow rollouts need exact target/revision, traffic/cost bounds, gates and fallback compatibility. Writing package or monitoring files does not launch a hosted endpoint, retrain a model or enable production alerts.

## Applied methods

### Artifact contract

Package model identity, preprocessing, ordered feature schema, categorical/missing behavior, dependency constraints and known-input expectations. Use supported safe loading behavior and trusted provenance; executable serialization is not an inert data format. A fresh-load smoke test must exercise the complete inference path, not only deserialize weights.

### Parity fixture

Send identical raw records through training and serving transformations. Compare names, order, units, defaults, category mappings and values before comparing predictions. Freeze artifact versions. If one side applies log scaling or reorders columns, report the first divergent boundary; output differences alone do not identify the cause.

### Serving and batch failure

Readiness means the intended model is usable. Validate input bounds before allocation/inference, enforce time and concurrency caps and return typed invalid-input versus service-failure outcomes. Avoid raw sensitive payload logging.

For batch work, identify model plus input snapshot per partition. Crash after output write and before checkpoint to verify safe replay. A resumed process must not mix predictions from a replacement model into an unlabeled output.

### Monitoring and promotion

Separate uptime, input schema, feature/prediction drift and delayed quality. Join outcomes with prediction/model identities and exclude immature follow-up from completed-quality denominators. Drift signals a distribution change; absent outcome evidence it does not prove lower accuracy.

Canary/shadow plans need exact traffic cohorts, budgets, predeclared stop criteria and a usable fallback artifact/schema. Before promotion, verify the fallback can still consume current inputs. Quantization, batching or new hardware performance claims need equivalent workload and quality comparisons, including cold start and tail latency where relevant.
