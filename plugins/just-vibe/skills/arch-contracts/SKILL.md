---
name: arch-contracts
description: "Define interfaces and contracts between components or services"
---

# arch-contracts

Define interfaces and contracts between components or services

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; producer/consumer boundaries, versions, and compatibility requirements.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Interface schemas, invariants, errors, ownership, and evolution; no endpoint implementation by default.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inventory actual consumers, compare current payloads and assumptions, define required/optional fields and errors, and design compatibility tests and deprecation steps.

## Deliver and verify

- Versioned contract proposal with examples and consumer obligations.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Old consumers handle an additive field; a removed required field is identified as breaking.

## Stop and recover

- Do not infer all consumers from one repository. Unknown consumers require a compatibility-preserving assumption or explicit decision.

## Example request

Define a versioned order-created contract that existing consumers can still read.
