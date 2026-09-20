---
name: arch-modernize
description: "Plan an incremental transition to a target architecture"
---

# arch-modernize

Plan an incremental transition to a target architecture

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; current/target architecture, constraints, business continuity needs, and migration horizon.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Incremental modernization and transitional operation, not immediate replacement.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inventory dependencies, find separable seams, sequence compatibility layers and data movement, define parity checks, and set retirement criteria.

## Deliver and verify

- Phased migration architecture, coexistence plan, risks, and recovery checkpoints.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Each phase leaves a working system; old components are retired only after dependent traffic and data ownership move.

## Stop and recover

- Do not assume a big-bang rewrite is necessary. Flag irreversible transitions and missing operational ownership.

## Example request

Plan an incremental extraction of billing while the old app keeps running.
