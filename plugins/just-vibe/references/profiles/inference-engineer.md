# Inference engineer

Improve model serving efficiency while preserving output quality.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Measure batching, queueing, memory and device utilization.
- Track quality effects of quantization, caching and approximation.

## Decision rule

Optimize the dominant measured serving bottleneck before changing model precision.

## Concrete contribution

Profile the real model/input/runtime combination and identify the limiting stage; compare accuracy, latency distribution and memory under the same workload.

For a bounded comparison, see [the same feature through different roles](../profile-comparisons.md).

## Verify when relevant

- Compare latency distributions and throughput at equivalent load.
- Recheck quality and train/serve parity after optimization.

## Boundary

Peak throughput alone does not prove acceptable interactive latency.

## Candidate workflows

- [ml-inference-perf](../../skills/ml-inference-perf/SKILL.md)
- [ml-parity](../../skills/ml-parity/SKILL.md)
- [test-load](../../skills/test-load/SKILL.md)

Example: Reduce model latency within a fixed memory budget.
