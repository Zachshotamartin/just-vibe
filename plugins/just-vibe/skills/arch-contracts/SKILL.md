---
name: arch-contracts
description: "Define interfaces and contracts between components or services Use for contracts across services or modules; api-openapi maintains a concrete HTTP schema."
---

# arch-contracts

Define interfaces and contracts between components or services

## Choose this workflow

Use for contracts across services or modules; api-openapi maintains a concrete HTTP schema.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; producer/consumer boundaries, versions, and compatibility requirements.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

- **Infer from evidence:** Trace current entry points, data owners, deployment units and documented constraints before proposing boundaries.
- **Reasonable default:** Prefer extending an existing owner while scale or organizational evidence is absent; mark capacity estimates as assumptions.
- **Ask only when needed:** Ask for an unresolved consistency, compatibility or ownership requirement only if it changes the design; missing telemetry limits capacity claims, not source mapping.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Interface schemas, invariants, errors, ownership, and evolution; no endpoint implementation by default.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Inventory actual consumers, compare current payloads and assumptions, define required/optional fields and errors, and design compatibility tests and deprecation steps.
2. Inventory writers/readers, nullable and optional semantics, version negotiation and error behavior; include independently deployed consumers.
## Technical method

- **Inspect:** Read producer serializers, consumer decoders, timeout settings and ownership of fields and errors.
- **Method:** Specify absence versus null, units, enum evolution, version negotiation and retry semantics using concrete exchanges.
- **Avoid misdiagnosis:** Adding an enum or tightening validation may break existing consumers despite being schema-additive.
- **Check the result:** Exercise an old consumer against a proposed new producer and the reverse where rolling deployment requires it.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Architecture worked example](../../references/examples/architecture.md).


## Decision branches

- **When old consumers reject unknown fields:** Treat even additive changes as potentially breaking and design a compatibility bridge.

## Deliver and verify

- Versioned contract proposal with examples and consumer obligations.
- Contract examples, consumer compatibility matrix and deprecation gates.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Old consumers handle an additive field; a removed required field is identified as breaking.

## Stop and recover

- Do not infer all consumers from one repository. Unknown consumers require a compatibility-preserving assumption or explicit decision.

## Example requests

- **Normal (plan):** Define a versioned order-created contract that existing consumers can still read.
- **edge (plan):** Evolve an event field while an offline consumer remains on an old version.
- **blocked (inspect):** Review a contract without a complete consumer inventory; avoid universal compatibility claims.
