---
name: compare
description: "Compare specific implementation approaches and their tradeoffs Use for a factual side-by-side comparison; decide recommends adoption and decision-matrix handles weighted priorities."
---

# compare

Compare specific implementation approaches and their tradeoffs

## Choose this workflow

Use for a factual side-by-side comparison; decide recommends adoption and decision-matrix handles weighted priorities.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; named approaches, project requirements, and important tradeoffs. Requires enough evidence to evaluate each option.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Compare concrete alternatives; weighted decision policy belongs to `decision-matrix`.

None by default. Plan artifacts may be saved when requested.

## Execute

- Normalize assumptions, compare behavior, complexity, maintenance, migration, and relevant cost; identify where evidence is missing.
- Normalize workload, feature requirements and time horizon; include a baseline/current option and distinguish switching cost from steady-state cost.

## Decision branches

- **When options meet different hard requirements:** Eliminate infeasible choices before ranking and explain the decisive incompatibility.

## Deliver and verify

- Side-by-side comparison, conditional recommendation, and a discriminating test if needed.
- Comparable assumptions, evidence-backed differences and conditions that change the result.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Options solve the same stated problem; a hard compatibility constraint can disqualify an otherwise attractive option.

## Stop and recover

- Do not invent benchmark or cost figures. If requirements are unresolved, give conditional choices rather than an arbitrary winner.

## Example requests

- **Normal (inspect):** Compare queue-backed jobs with our existing database job runner.
- **edge (inspect):** Compare two queues when ordering is required only within an account.
- **blocked (inspect):** Compare these proposals without usage or pricing data; leave costs bounded or unknown.
