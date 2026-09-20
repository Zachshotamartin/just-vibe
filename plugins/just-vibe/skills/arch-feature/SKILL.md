---
name: arch-feature
description: "Design where a feature belongs within the existing architecture"
---

# arch-feature

Design where a feature belongs within the existing architecture

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; feature specification, current architecture, and scale/compatibility constraints.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Placement of one feature across modules, services, storage, and interfaces.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace similar features, assign responsibilities, define seams and contracts, compare reuse with new components, and plan an incremental delivery path.

## Deliver and verify

- Component-level design, affected interfaces, data flow, migration needs, and verification plan.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Existing domain rules stay owned by one clear boundary; error and rollback paths are covered.

## Stop and recover

- Do not introduce a service or datastore solely for stylistic separation. Flag decisions requiring workload or ownership information.

## Example request

Design where organization invitations fit in the existing architecture.
