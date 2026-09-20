---
name: arch-boundaries
description: "Find misplaced responsibilities, dependency cycles, and leaking abstractions"
---

# arch-boundaries

Find misplaced responsibilities, dependency cycles, and leaking abstractions

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; modules/services and intended responsibility rules.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Coupling, cycles, ownership leaks, and misplaced responsibilities; no automatic service extraction.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect import/call graphs and data ownership, trace changes crossing boundaries, compare declared rules with behavior, and rank actionable violations.

## Deliver and verify

- Boundary findings with examples and incremental repair options.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A dependency cycle has a concrete path; a justified shared utility is not rejected merely for having many callers.

## Stop and recover

- Distinguish organizational preference from demonstrated architectural cost. Missing ownership rules become questions, not invented mandates.

## Example request

Find responsibility leaks and dependency cycles in billing.
