---
name: arch-event-flow
description: "Design event delivery, retries, ordering, and failure handling Use for asynchronous consistency and delivery design; backend-jobs implements worker mechanics."
---

# arch-event-flow

Design event delivery, retries, ordering, and failure handling

## Choose this workflow

Use for asynchronous consistency and delivery design; backend-jobs implements worker mechanics.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Architecture methods](../../references/packs/architecture.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; event source, consumers, delivery guarantees, and failure requirements.

readable source, infrastructure/configuration definitions, and any supplied system documentation. Runtime telemetry is optional evidence, never assumed available. Architecture proposals remain plans until implementation is requested.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Event ownership, ordering, deduplication, retries, dead letters, and replay.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace transaction boundaries, identify loss/duplicate windows, specify identifiers and schemas, and define recovery and observability for each failure point.
- Draw the write/commit/publish/ack sequence and place a crash between each pair; define replay identity and effect ownership.

## Decision branches

- **When database commit and broker publish are separate:** Compare a transactional outbox or explicit reconciliation with the actual loss window.

## Deliver and verify

- Event sequence diagram, delivery contract, failure matrix, and validation scenarios.
- Failure-point table covering loss, duplicate, reordering, poison messages and recovery.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Duplicate and out-of-order deliveries have defined outcomes; a producer crash between database and broker operations is addressed.

## Stop and recover

- Do not promise exactly-once effects without a concrete consistency mechanism. Avoid choosing infrastructure without throughput and operational constraints.

## Example requests

- **Normal (plan):** Plan webhook-to-ledger processing with duplicate and reordered events.
- **edge (plan):** Design order events with duplicate delivery and a producer crash after commit.
- **blocked (inspect):** Assess event flow when broker guarantees are unknown; keep guarantees conditional.
