---
name: ops-observability
description: "Add useful logs, metrics, and traces to unclear execution paths Use to implement requested diagnostic telemetry; ops-alerts turns signals into actionable notifications."
---

# ops-observability

Add useful logs, metrics, and traces to unclear execution paths

## Choose this workflow

Use to implement requested diagnostic telemetry; ops-alerts turns signals into actionable notifications.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Operations methods](../../references/packs/operations.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; unclear path, diagnostic goals, telemetry stack, privacy, and overhead constraints.

exact service/environment, time window, revision/configuration identity, authorized logs/metrics, and operational constraints. Prefer observation before intervention; live restarts, traffic changes, restores, and notifications require the requested target/action. Redact sensitive telemetry.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Useful logs, metrics, traces, correlation, and error context in the selected path.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Identify questions telemetry must answer, choose stable low-cardinality dimensions, propagate correlation, redact data, and verify normal/error instrumentation locally.
- Start with questions operators must answer, propagate correlation across boundaries and select bounded-cardinality metrics plus redacted structured events.

## Decision branches

- **When proposed labels contain user IDs or arbitrary payload values:** Move needed detail to controlled logs/traces or aggregate dimensions instead of unbounded metric labels.

## Deliver and verify

- Instrumentation changes, field/metric definitions, and validation evidence.
- Question/signal/location table, privacy/overhead decisions and success/error telemetry checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A failed operation can be traced across the intended boundary; raw user payloads or unbounded IDs do not become unsafe metric labels.

## Stop and recover

- No provider provisioning or production configuration rollout implicitly. Do not add high-volume logging without overhead consideration.

## Example requests

- **Normal (apply):** Add focused tracing without logging raw user payloads or high-cardinality labels.
- **edge (apply):** Add tracing across a queue while keeping sensitive payloads out of logs.
- **blocked (inspect):** Design observability without provisioning a vendor or changing production configuration.
