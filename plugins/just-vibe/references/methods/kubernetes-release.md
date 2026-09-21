# Kubernetes release and failure recovery

Use when: kubernetes, readiness probe, rolling update.

Review or change a named workload with its namespace, cluster and release authority established.

## Inspect first

- Deployment, Service, ingress, resource requests/limits
- Startup/readiness/liveness semantics
- Shutdown grace period, disruption budget and rollback artifact

## Method

1. Separate startup from liveness and readiness. A temporarily unavailable dependency should not cause every pod to restart together.
2. Trace termination: mark unavailable, stop accepting work, drain bounded requests, finish or requeue jobs, then exit within the grace period.
3. Check rolling-update capacity, surge/unavailable limits, schema compatibility and node scheduling constraints before applying.
4. Use a dry run and an isolated namespace for failure injection. A requested production rollout needs the exact cluster/context and reviewed manifest.

## Failure cases

- Readiness succeeds before initialization, routing traffic into failures.
- Aggressive liveness creates restart storms during a dependency outage.
- A migration breaks still-running old replicas.

## Verification

- Observe rollout conditions, endpoints and actual requests.
- Simulate slow startup and SIGTERM; verify bounded shutdown.
- Record rollback command, previous image digest and data compatibility.

## Worked scenario

A slow cache outage should remove readiness when necessary without repeatedly killing otherwise healthy pods.

## Version-sensitive primary references

- [kubernetes.io](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) — Read the official source for the installed version before relying on a version-sensitive API.
- [kubernetes.io](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
