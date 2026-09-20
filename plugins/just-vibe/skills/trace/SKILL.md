---
name: trace
description: "Follow a request, event, or data value through the system"
---

# trace

Follow a request, event, or data value through the system

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; request, event, identifier, or data value and optional environment/time window. Requires source or relevant sanitized telemetry.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

One end-to-end execution/data path, including service boundaries; no new instrumentation by default.

None by default. Plan artifacts may be saved when requested.

## Execute

- Identify the entry point, follow transformations and dispatches, correlate available IDs, and mark async boundaries and missing spans.

## Deliver and verify

- Ordered path with source/telemetry evidence, transformations, failure branches, and gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An async job is separated from its triggering request; an absent downstream log is reported as a gap rather than proof of success.

## Stop and recover

- Do not scan unrelated tenant data or infer causation from timestamp proximity alone.

## Example request

Trace an order from the checkout route through the payment job.
