---
name: help
description: "Find the right command and show examples Use to choose a workflow and explain invocation; tools lists/searches the inventory."
---

# help

Find the right command and show examples

## Choose this workflow

Use to choose a workflow and explain invocation; tools lists/searches the inventory.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; optional command name, scenario, or question. Requires the shipped catalog and actual implementation status.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Explain usage and recommend workflows; inventory browsing belongs to `tools`.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Use toolkit tools with the supplied scenario and the actual target host. Read only the matching command contracts with toolkit show; do not load all skills.
2. Answer the immediate usage question with the smallest useful invocation for the best matching available workflow, preserving all user constraints. If a candidate is unknown or blocked, name the precise missing task evidence or integration.
3. If the user asks installation questions, use the installed setup skill or the bundled installer help. A help question is not permission to execute the recommended workflow.
## Technical method

- **Inspect:** Resolve the user's task and whether they need discovery, invocation syntax or workflow details.
- **Method:** Show a small relevant selection with appended-context examples and necessary prerequisites.
- **Avoid misdiagnosis:** Dumping every command creates search burden; a lexical match does not establish capability availability.
- **Check the result:** Confirm each suggested command exists and explain the boundary between near matches without starting the task implicitly.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Browsing, routing or explaining the new utilities: [Discovery and daily utilities](../../references/daily-workflows.md).
- The task needs scoped memory search, a persistent goal, independent review, configuration scanning, worker control, learned-pattern review or editor installation: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- Discovering session, inventory, rule, council, scheduler, monitor, graph, evaluation, operator or domain-specific capabilities: [Extended capabilities and optional method library](../../references/runtime-expansion.md).

## Decision branches

- **When the best workflow lacks required evidence:** Explain the missing capability and a useful evidence-only alternative without falsely marking it available.

## Deliver and verify

- Relevant usage instructions with availability and examples.
- Selected command, why it fits, required context and host-appropriate invocation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A scenario finds the correct specialist command; a planned command is clearly identified as unavailable.

## Stop and recover

- Do not execute the recommended workflow merely because help was requested. Fall back to installed capabilities when discovery is incomplete.

## Example requests

- **Normal (inspect):** Which command investigates good offline ML scores but poor production results?
- **edge (inspect):** Explain whether I need explain, teach or trace for this function.
- **blocked (inspect):** Find a suitable deployment command without provider access; show prerequisites.
