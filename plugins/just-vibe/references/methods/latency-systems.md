# Latency budgets and performance experiments

Use when: tail latency, latency critical, p99, benchmark optimization.

Improve a measured bottleneck while preserving correctness and resource bounds.

## Inspect first

- Request path, percentile window and concurrency
- Warmup/JIT/cache states and hardware
- Queue length, allocation, I/O and cancellation

## Method

1. Define the acceptance workload and a correctness oracle before tuning. Keep baseline and candidate measurements under the same environment.
2. Break end-to-end latency into queueing, compute, serialization and dependency spans; optimize the dominant measured term.
3. Avoid unbounded batching or concurrency. Explicitly trade throughput against tail latency and memory, with backpressure when saturated.
4. Run repeated samples with warmup separated; report variance, sample count and bottleneck movement. Revert changes whose gain vanishes under the realistic workload.

## Failure cases

- An average improves while p99 regresses through queue buildup.
- A benchmark measures cached results instead of the changed algorithm.
- Cancellation leaves work running and resource usage climbing.

## Verification

- Use an adversarial large/slow input and sustained saturation case.
- Report original and candidate raw measurements plus correctness results.
- Do not claim a universal speedup from one microbenchmark.

## Worked scenario

An added worker pool must be tested at saturation, where queue wait can dominate the faster per-item computation.

## Version-sensitive primary references

- [opentelemetry.io](https://opentelemetry.io/docs/concepts/signals/traces/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.brendangregg.com](https://www.brendangregg.com/methodology.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
