---
name: decision-buy-build
description: "Compare building, buying, and integrating a solution Use for vendor versus internal capability decisions; research verifies current vendor claims."
---

# decision-buy-build

Compare building, buying, and integrating a solution

## Choose this workflow

Use for vendor versus internal capability decisions; research verifies current vendor claims.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Decisions methods](../../references/packs/decisions.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; capability, team capacity, compliance/integration constraints, volume, and budget.

the decision question, constraints, alternatives or permission to identify them, and relevant project evidence. Current vendor claims and prices require current authoritative sources during execution. Scores are decision aids, not facts.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Build, buy, and hybrid options across initial and ongoing ownership.

None by default. Plan artifacts may be saved when requested.

## Execute

- Compare fit, integration, maintenance, migration, service dependence, and total-cost assumptions; verify current vendor capabilities when relevant.
- Compare integration, operations, staffing, exit/export and failure ownership over a stated usage horizon; include the current workaround.

## Technical method

- **Inspect:** Establish functional requirements, integration surfaces, support burden, data export and verified pricing terms.
- **Apply:** Compare lifecycle scenarios including maintenance, incident response, migration and exit; retain uncertainty ranges instead of invented estimates.
- **Avoid misdiagnosis:** Vendor feature lists do not prove compatibility with the actual identity, offline or data-residency requirements.
- **Check the result:** Validate the decisive integration with a bounded example and compare exit costs as well as the happy-path purchase.

## Decision branches

- **When a vendor lacks a hard requirement or usable export:** Exclude it or state the explicit compromise before calculating weighted convenience.

## Deliver and verify

- Option comparison, recommendation, cost model inputs, and a validation/exit plan.
- Fit/gap matrix, cost assumptions, ownership burden and exit plan.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Maintenance and migration effort appear alongside subscription cost; a vendor missing a hard feature is excluded.

## Stop and recover

- No purchases or account creation. Do not convert speculative usage into precise budget claims.

## Example requests

- **Normal (plan):** Compare building and buying organization authentication with future SSO.
- **edge (plan):** Compare buying search with building it when private indexing is required.
- **blocked (inspect):** Assess buy versus build with no price quote; keep uncertain costs as ranges.
