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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; named approaches, project requirements, and important tradeoffs. Requires enough evidence to evaluate each option. A request to build or try alternatives uses apply mode.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Compare concrete alternatives; weighted decision policy belongs to `decision-matrix`.

Inspect/plan: compare from evidence; save requested artifacts only. Apply (a request to build or try alternatives): write only in owned lab worktrees under .just-vibe/workspaces, run owned preview processes, and apply the chosen variant through lab select with an undo record only after the user selects it. No commit, push or deploy.

## Execute

1. Normalize assumptions, compare behavior, complexity, maintenance, migration, and relevant cost; identify where evidence is missing.
2. Normalize workload, feature requirements and time horizon; include a baseline/current option and distinguish switching cost from steady-state cost.
3. Keep an ordinary comparison in inspect/plan mode. When the brief explicitly asks to build or try alternatives, define two or three distinct approaches with the same requirements and budget, inspect the Git root and starting changes, and create a lab using the working-alternatives guide.
4. Implement each approach in its returned owned worktree. Preserve initial user edits and use equivalent dependency/test conditions; record meaningful environment differences. Read and run the same declared checks for all variants and inspect actual renders before describing visual behavior.
5. For previewable projects, launch a bounded lease with the real loopback server command and literal {port} placeholder; verify its response and open the comparison report and previews. Compare observable behavior and subjective tradeoffs separately, with no invented universal quality score.
6. Apply the selected variant only after the user selects it or has explicitly delegated that choice. Require fresh checks and unchanged original files/index in the affected scope. Use lab select to journal the application and produce an undo task; preserve unrelated original edits.
7. Stop owned preview processes and clean up reviewed workspace snapshots when requested or as agreed for the task. Preserve wanted alternatives first. Recover interrupted selection through lab recover; never force-clean a stale or unowned workspace.
## Technical method

- **Inspect:** Identify alternatives, common requirements, evaluation conditions and whether working implementations were requested.
- **Method:** Compare like-for-like behavior; use isolated variants with shared checks when building alternatives is in scope.
- **Avoid misdiagnosis:** Unequal feature completeness or different datasets can manufacture a winner; human preference remains attributed judgment.
- **Check the result:** Apply the same checks to every variant and distinguish measured results, subjective acceptance and blocked evidence.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- The user requests implemented alternatives or live previews: [Working alternatives](../../references/working-alternatives.md).

## Decision branches

- **When options meet different hard requirements:** Eliminate infeasible choices before ranking and explain the decisive incompatibility.
- **When the user asks to build alternatives:** Use isolated lab worktrees, equal checks and actual previews, then apply only the authorized selection.

## Deliver and verify

- Side-by-side comparison, conditional recommendation, and a discriminating test if needed.
- Comparable assumptions, evidence-backed differences and conditions that change the result.
- Working variants, shared check evidence, preview/report links, selected changes and an undo record when applied.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Options solve the same stated problem; a hard compatibility constraint can disqualify an otherwise attractive option.

## Stop and recover

- Do not invent benchmark or cost figures. If requirements are unresolved, give conditional choices rather than an arbitrary winner.

## Example requests

- **Normal (inspect):** Compare queue-backed jobs with our existing database job runner.
- **edge (inspect):** Compare two queues when ordering is required only within an account.
- **blocked (inspect):** Compare these proposals without usage or pricing data; leave costs bounded or unknown.
- **Additional (apply):** Build two alternative account switchers, preview both and apply the one I choose.
