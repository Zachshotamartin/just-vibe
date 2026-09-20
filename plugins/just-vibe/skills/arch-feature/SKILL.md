---
name: arch-feature
description: "Design where a feature belongs within the existing architecture Use to place an accepted feature within a system; spec resolves unclear product behavior."
---

# arch-feature

Design where a feature belongs within the existing architecture

## Choose this workflow

Use to place an accepted feature within a system; spec resolves unclear product behavior.

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
- Map each acceptance condition to an existing owner and interface; compare extending a boundary with introducing a new one under actual operational constraints.

## Decision branches

- **When the feature spans two data owners:** Define consistency and failure semantics before selecting synchronous calls or events.

## Deliver and verify

- Component-level design, affected interfaces, data flow, migration needs, and verification plan.
- Responsibility table, interface changes, compatibility phases and end-to-end checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Existing domain rules stay owned by one clear boundary; error and rollback paths are covered.

## Stop and recover

- Do not introduce a service or datastore solely for stylistic separation. Flag decisions requiring workload or ownership information.

## Example requests

- **Normal (plan):** Design where organization invitations fit in the existing architecture.
- **edge (plan):** Design a feature that updates billing and access without a distributed transaction.
- **blocked (inspect):** Plan placement while an external consumer contract is unavailable.
