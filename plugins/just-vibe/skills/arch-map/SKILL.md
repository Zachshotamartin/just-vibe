---
name: arch-map
description: "Map services, packages, data stores, external dependencies, and relationships"
---

# arch-map

Map services, packages, data stores, external dependencies, and relationships

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; system boundary, services/environments, and desired detail.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Existing services, stores, deployment units, trust boundaries, and external dependencies.

None by default. Plan artifacts may be saved when requested.

## Execute

- Reconcile source, deployment configuration, and documentation; identify ownership and protocols; trace a representative request and background process; label inferred edges.

## Deliver and verify

- System diagram, component inventory, data/control flows, and evidence gaps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A shared database dependency appears even without source imports; a documented but undeployed service is marked uncertain.

## Stop and recover

- Do not describe a static diagram as proof of live topology. Missing infrastructure access limits deployment conclusions.

## Example request

Map our web app, workers, shared database, and external payment service.
