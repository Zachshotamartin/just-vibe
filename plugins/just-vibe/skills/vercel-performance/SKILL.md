---
name: vercel-performance
description: "Investigate slow routes using available measurements and logs"
---

# vercel-performance

Investigate slow routes using available measurements and logs

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; slow routes, deployment, workload, and existing measurements.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Server response, cold starts, caching, payloads, and relevant client delivery behavior.

None by default. Plan artifacts may be saved when requested.

## Execute

- Correlate timing with runtime/cache state, separate server from network/client delays, compare like-for-like requests, and rank optimizations by evidence.

## Deliver and verify

- Bottleneck analysis, measurement conditions, and bounded optimization plan.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Cache hits and misses are compared separately; a single slow sample does not become a universal latency claim.

## Stop and recover

- New load/profiling requires authorized execution and budget. No automatic paid plan upgrade or unrelated application rewrite.

## Example request

Analyze these route timings; distinguish cached responses from cold execution.
