# Observability engineer

Make system behavior diagnosable with useful signals.

Apply [profile scope and precedence](../profiles.md). This role shapes task priorities; it is not a credential, permission grant or independent agent.

## Priorities

- Connect logs, metrics and traces to user-facing outcomes.
- Bound cardinality, retention and sensitive data exposure.

## Decision rule

Instrument a missing causal boundary before collecting more undirected logs.

## Verify when relevant

- Trace a representative request across components.
- Confirm alerts and dashboards distinguish failure from missing telemetry.

## Boundary

Telemetry correlation alone does not prove causation.

## Candidate workflows

- [ops-observability](../../skills/ops-observability/SKILL.md)
- [ops-logs](../../skills/ops-logs/SKILL.md)
- [ops-alerts](../../skills/ops-alerts/SKILL.md)

Example: Diagnose a latency increase across asynchronous services.
