# ML deployment methods

Resolve model, preprocessing, feature order, schema, dependency and runtime versions. Check artifact provenance before loading formats that can execute code. Package all inference requirements together and test known inputs in a fresh supported environment; do not include training data or credentials unnecessarily.

Serving validates input shape/types and resource limits, reports readiness only after the intended model loads, and exposes safe operational errors. Batch inference uses stable output keys, partitions, model-version labels and durable checkpointed writes; account for every invalid/failed record.

Parity compares identical raw inputs through each transformation boundary and locates the first divergence. Separate numerical tolerance from different semantics/versions. Performance separates cold/warm paths and measures latency distributions, throughput and memory under declared workloads; optimization includes a quality comparison.

Drift needs aligned baseline/current windows, sample-size and seasonal context. Distribution change alone does not prove quality loss. Monitoring separates leading operational signals from delayed outcome labels. Canary/shadow rollouts need exact target/revision, traffic/cost bounds, gates and fallback compatibility. Writing package or monitoring files does not launch a hosted endpoint, retrain a model or enable production alerts.
