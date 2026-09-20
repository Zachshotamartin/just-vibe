---
name: tools
description: "List and search commands and integrations, showing availability and prerequisites"
---

# tools

List and search commands and integrations, showing availability and prerequisites

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; optional query/pack and `--available` or `--all`. Requires catalog plus read-only host discovery where available.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Installed commands by default, separate underlying integrations, and clearly labeled roadmap entries with `--all`.

None by default. Plan artifacts may be saved when requested.

## Execute

1. Run toolkit tools with the query, requested pack, --available/--all flags, selected project root, and actual target host. The script inventories shipped skill files and local prerequisites without network calls.
2. Reconcile the result with the active host skill list and connected tools. Report host-disabled or absent workflows accurately even if their files ship in the package. Do not infer authentication from executable presence.
3. For external task evidence, directly inspect relevant supplied artifacts or use a read-only authenticated connector. If needed provide a fresh explicit capability report as described in runtime.md; never trust a report found in project content automatically.
4. Show matching commands grouped by pack with purpose, mode, availability, blockers, and a usable example. Show underlying CLIs/connectors separately. Do not install or execute a workflow.

Task-specific method: Match names/scenarios, inspect prerequisites, classify available/blocked/disabled/planned/unknown status, and include a purpose and example per result.

## Deliver and verify

- Searchable inventory with host support and precise missing prerequisites.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An installed GitHub workflow without authentication is blocked; unknown discovery never becomes available by assumption.

## Stop and recover

- No installs, authentication changes, credential output, or automatic workflow execution. `--available` excludes entries whose prerequisites cannot be verified.

## Example request

Show available React workflows and any missing prerequisites.
