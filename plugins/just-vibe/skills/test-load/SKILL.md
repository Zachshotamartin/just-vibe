---
name: test-load
description: "Execute bounded workloads against authorized environments Use for a bounded authorized workload experiment; perf diagnoses an existing measured bottleneck."
---

# test-load

Execute bounded workloads against authorized environments

## Choose this workflow

Use for a bounded authorized workload experiment; perf diagnoses an existing measured bottleneck.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Testing methods](../../references/packs/testing.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; exact authorized endpoint/environment, workload, concurrency/rate/duration caps, and stop thresholds.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Execution belongs in apply mode. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Controlled load/capacity experiment; execution needs explicit target and resource authorization.

None by default. Plan artifacts may be saved when requested.

## Execute

- Validate isolation and side effects, establish baseline, ramp within limits, observe latency/errors/resources, stop on thresholds, and correlate saturation.
- Define exact target, traffic shape, concurrency/rate/duration and stop thresholds; validate side effects and ramp in a controlled environment with telemetry.

## Decision branches

- **When error rate or resource pressure crosses the declared cap:** Stop traffic, preserve measurements and report the last stable level without extrapolating beyond it.

## Deliver and verify

- Load script/protocol or run report with conditions, bottlenecks, and cleanup.
- Workload/caps, time series, stop event and measured saturation boundary.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The configured request cap is enforced; rising errors or resource pressure triggers a bounded stop.

## Stop and recover

- No third-party or production stress by assumption. Do not extrapolate measured capacity beyond the tested workload without qualifications.

## Example requests

- **Normal (plan):** Plan load tests for the specified staging endpoint with duration and error stop limits.
- **edge (plan):** Plan a ramp test that must stop before shared database pressure exceeds a threshold.
- **blocked (inspect):** Prepare a load-test plan with no authorized endpoint; do not generate traffic.
