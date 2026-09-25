---
name: skill
description: "Create or improve a workflow skill. Use to author or revise a reusable workflow; ordinary one-off work should not create a new skill."
---

# skill

Create or improve a workflow skill.

## Choose this workflow

Use to author or revise a reusable workflow; ordinary one-off work should not create a new skill.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; workflow purpose, activation conditions, target host, and examples.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Create/update a skill and necessary supporting utilities; installation/publication is separate unless requested.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Inspect existing skills and the target host's packaging conventions; define the boundary, inputs, and one matching and one near-miss request.
2. Write actionable instructions, separate repeatable execution into utilities, and move conditional detail into references only when needed. When the project generates its skills, edit the source catalog or generator, not the generated SKILL.md.
3. Validate triggering with the matching and near-miss requests, and behavior with fixtures.

## Technical method

- **Inspect:** Read the intended invocation, neighboring workflows, input/output contract and required supporting assets.
- **Method:** Keep the entry point focused and route conditional depth to self-contained references; preserve user scope and existing invocation policy.
- **Avoid misdiagnosis:** Long generic checklists dilute useful detail, and a linked guide that is never loaded cannot improve behavior.
- **Check the result:** Validate frontmatter/references and exercise a representative request plus a nearby nonmatching request; structural validity is not behavioral proof.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Dependencies, builds, secrets, hooks or privileged execution cross a trust boundary: [Dependency and execution provenance](../../references/security/supply-chain.md).
- The task needs scoped memory search, a persistent goal, independent review, configuration scanning, worker control, learned-pattern review or editor installation: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- The task specifically involves agent harness, mcp server, prompt optimization, tool routing; load only the matching method: [Agent harness and MCP server engineering](../../references/methods/agent-harness.md).
- Discovering session, inventory, rule, council, scheduler, monitor, graph, evaluation, operator or domain-specific capabilities: [Extended capabilities and optional method library](../../references/runtime-expansion.md).
- The skill targets a specific host's skill format or install location; read the Host mapping section: [Host skill formats](../../references/runtime.md).

## Decision branches

- **When guidance merely repeats generic model capabilities:** Remove it and retain decisions, invariants and examples that change behavior.

## Deliver and verify

- Skill entry point and supporting assets with capability requirements, usage examples, matching boundaries and independent fixture evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A matching request triggers the intended behavior; a nearby out-of-scope request does not acquire unrelated instructions.

## Stop and recover

- Do not create universal catch-all skills, silently enable hooks, or claim executable guarantees from prose alone.

## Example requests

- **Normal (apply):** Create a focused workflow for reviewing database migrations in this project.
- **Edge (apply):** Create a skill whose name overlaps an existing deployment workflow.
- **Blocked (inspect):** Review a proposed skill without host installation access or claiming it is enabled.
