---
name: arch-map
description: "Map deployed services, data stores, external providers and their runtime relationships. Use for deployed service/store topology; map covers repository modules."
---

# arch-map

Map deployed services, data stores, external providers and their runtime relationships.

## Choose this workflow

Use for deployed service/store topology; map covers repository modules.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; system boundary, services/environments, and desired detail.

**Pack prerequisites:** Readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

- **Infer from evidence:** Trace current entry points, data owners, deployment units and documented constraints before proposing boundaries.
- **Reasonable default:** Prefer extending an existing owner while scale or organizational evidence is absent; mark capacity estimates as assumptions.
- **Ask only when needed:** Ask for an unresolved consistency, compatibility or ownership requirement only if it changes the design; missing telemetry limits capacity claims, not source mapping.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Existing services, stores, deployment units, trust boundaries, and external dependencies.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Reconcile source, deployment configuration, and documentation; identify ownership and protocols; trace a representative request and background process; label inferred edges.
2. Trace one request and one background operation, marking process, network, ownership and trust boundaries independently.

## Technical method

- **Inspect:** Inspect composition roots, manifests, outbound clients, infrastructure definitions and queue registrations; associate each edge with its source.
- **Method:** Separate imports, runtime calls and deployment boundaries. Follow one request into durable storage and one asynchronous continuation.
- **Avoid misdiagnosis:** A package dependency does not prove a network call or independently deployed service; missing infrastructure leaves deployment unknown.
- **Check the result:** Reconcile one diagram path against real entry points and consumers, including an error return; label inferred edges.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Architecture worked example](../../references/examples/architecture.md).


## Decision branches

- **When documentation disagrees with deployment configuration:** Show both claims with evidence dates and leave live topology unconfirmed without observations.

## Deliver and verify

- System diagram, component inventory, data/control flows, and evidence gaps.
- Nodes/edges with protocol, owner, data classification and evidence confidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A shared database dependency appears even without source imports; a documented but undeployed service is marked uncertain.

## Stop and recover

- Do not describe a static diagram as proof of live topology. Missing infrastructure access limits deployment conclusions.

## Example requests

- **Normal (inspect):** Map our web app, workers, shared database, and external payment service.
- **Edge (inspect):** Map two services sharing a database but no source imports.
- **Blocked (inspect):** Map supplied manifests without infrastructure access; distinguish intended from observed deployment.
