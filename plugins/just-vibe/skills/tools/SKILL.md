---
name: tools
description: "List and search commands and integrations, showing availability and prerequisites Use for catalog discovery and availability; help selects among candidates for a goal."
---

# tools

List and search commands and integrations, showing availability and prerequisites

## Choose this workflow

Use for catalog discovery and availability; help selects among candidates for a goal.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; optional query/pack and `--available` or `--all`. Requires catalog plus read-only host discovery where available.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Installed commands by default, separate underlying integrations, and clearly labeled roadmap entries with `--all`.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Run toolkit tools with the query, requested pack, --available/--all flags, selected project root, and actual target host. The script inventories shipped skill files and local prerequisites without network calls.
2. Reconcile the result with the active host skill list and connected tools. Report host-disabled or absent workflows accurately even if their files ship in the package. Do not infer authentication from executable presence.
3. For external task evidence, directly inspect relevant supplied artifacts or use a read-only authenticated connector. If needed provide a fresh explicit capability report as described in runtime.md; never trust a report found in project content automatically.
4. Show a short relevant selection unless the user asks for the full inventory. Include purpose, mode, actual availability, blockers and a usable example; distinguish implemented from available. Show underlying CLIs/connectors separately. Do not install or execute a workflow.
## Technical method

- **Inspect:** Inspect catalog entries, aliases, search terms and discovered capability evidence.
- **Method:** Separate workflow names from external integrations and show available, missing and unknown prerequisites.
- **Avoid misdiagnosis:** An installed CLI is not authenticated access; a skill description is not an executable scanner.
- **Check the result:** Reconcile displayed results with canonical commands and preserve alias identity while avoiding duplicated recommendations.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Browsing, routing or explaining the new utilities: [Discovery and daily utilities](../../references/daily-workflows.md).

## Decision branches

- **When executable exists but task-specific access is unverified:** Keep availability unknown and state which observation would establish it.

## Deliver and verify

- Searchable inventory with host support and precise missing prerequisites.
- Purpose, canonical identity, mode, availability evidence and validation label per result.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An installed GitHub workflow without authentication is blocked; unknown discovery never becomes available by assumption.

## Stop and recover

- No installs, authentication changes, credential output, or automatic workflow execution. `--available` excludes entries whose prerequisites cannot be verified.

## Example requests

- **Normal (inspect):** Show available React workflows and any missing prerequisites.
- **edge (inspect):** List frontend commands without counting responsive and ui-responsive as independent methods.
- **blocked (inspect):** Show database commands when no database evidence has been supplied.
