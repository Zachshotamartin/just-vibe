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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan by default; apply to write the load script and run a bounded workload against the exact authorized target within the stated caps and stop thresholds. Requires exact authorized endpoint/environment, workload, concurrency/rate/duration caps, and stop thresholds.

defined behavior, existing test conventions/runners, isolated fixtures, and relevant dependencies. Requested bounded verification may use owned isolated fixtures without authorizing product edits or live-system tests. Never test destructive behavior against production by default; distinguish mocked behavior from real integration evidence.

- **Infer from evidence:** Read behavior contracts, existing runners and test conventions; distinguish fixture setup failure from a behavioral failure.
- **Reasonable default:** Use the smallest existing local runner and isolated synthetic fixtures that distinguish the requested behavior.
- **Ask only when needed:** Ask about an unresolved contract that changes the expected result, or the target/load limits before external testing; do not ask the user to choose a runner already configured.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Controlled load/capacity experiment; execution needs explicit target and resource authorization.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Validate isolation and side effects, establish baseline, ramp within limits, observe latency/errors/resources, stop on thresholds, and correlate saturation.
2. Define exact target, traffic shape, concurrency/rate/duration and stop thresholds; validate side effects and ramp in a controlled environment with telemetry.
## Technical method

- **Inspect:** Resolve exact authorized target, realistic workload, rate/concurrency/duration caps and resource stop thresholds.
- **Method:** Model arrivals and user journeys explicitly; monitor server and client bottlenecks and isolate real payments/messages.
- **Avoid misdiagnosis:** Closed-loop clients can hide overload by slowing request generation; averages conceal long tails and errors.
- **Check the result:** Confirm healthy control load, bounded ramp and recovery, preserving actual achieved rates, tail latency and stop reason.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Testing worked example](../../references/examples/testing.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves windows desktop, ui automation, cross-agent regression, benchmark harness; load only the matching method: [Desktop and cross-host regression testing](../../references/methods/desktop-regression.md).

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
- **Additional (apply):** Run the approved staging load test on the search endpoint at up to 100 requests per second for five minutes, stopping above 1 percent errors.
