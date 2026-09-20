---
name: test-load
description: "Execute bounded workloads against authorized environments"
---

# test-load

Execute bounded workloads against authorized environments

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

## Deliver and verify

- Load script/protocol or run report with conditions, bottlenecks, and cleanup.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The configured request cap is enforced; rising errors or resource pressure triggers a bounded stop.

## Stop and recover

- No third-party or production stress by assumption. Do not extrapolate measured capacity beyond the tested workload without qualifications.

## Example request

Plan load tests for the specified staging endpoint with duration and error stop limits.
