---
name: setup
description: "Install, update, or remove just-vibe through native host plugin management. Use for an intentional installation, update or removal; doctor inspects without changes."
---

# setup

Install, update, or remove just-vibe through native host plugin management.

## Choose this workflow

Use for an intentional installation, update or removal; doctor inspects without changes.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Installation methods](../../references/packs/installation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for an installation request; target host, bundled source, --github or --local checkout, and Claude scope. A preview request uses the existing `--dry-run` behavior.

Node.js 22+. Codex and Claude targets also need the host CLI with native plugin support; editor adapters need only the project directory. Git is required only for --github. Use the bundled installer; preserve marketplace and scope checks.

- **Infer from evidence:** Inspect selected host, native CLI support, existing source/scope and package version without changing global configuration.
- **Reasonable default:** Use the documented bundled source and existing host conventions unless the user selects another source.
- **Ask only when needed:** Ask only when multiple host/scope/source choices cannot be resolved from context and would change installation; report an actual missing executable instead of requesting unrelated credentials.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Install/enable just-vibe through the selected host's plugin manager; no unrelated plugin, permission, hook, or integration changes.

Selected host plugin registration and its managed just-vibe payload directory. For Claude, also the owned shortcut files: the jv skills-directory plugin (skills/just-vibe-shortcuts), commands/jv.md, commands/just-vibe.md and .just-vibe/installations/claude-shortcuts.json, under ~/.claude at user scope or the project .claude folder at project or local scope. Editor adapters write only their listed project files.

## Execute

1. Resolve scripts/installer.mjs relative to this installed plugin. Choose doctor for a status question, setup for an install request, update for a refresh request, and uninstall only for an explicit removal request.
2. Honor the host, bundled default / --github / --local source and Claude --scope user|project|local; Claude project/local operations run with the project as the working directory; --root applies only to editor adapters. Never place tokens in commands or files.
3. For a requested preview append --dry-run and report conditional steps without claiming installed state was inspected. Preserve all native source/scope/inventory conflict checks.
4. Read back native source, scope, enabled state and version after the authorized installation; preserve unrelated plugins and report partial native failures. Explain that changed skills load in a fresh conversation. Uninstall retains marketplace registration and persistent data. Do not bypass errors with global edits or cache deletion.
## Technical method

- **Inspect:** Resolve host, scope, source channel, native plugin inventory and candidate bundled version.
- **Method:** Use the supported installer lifecycle and persistent payload, reconciling existing source identity before update or removal.
- **Avoid misdiagnosis:** A package-manager install alone does not register a native plugin; deleting package cache must not break the managed payload.
- **Check the result:** Read back the native inventory: source, scope, enabled state and payload version match the request, and for Claude the owned shortcut files report healthy.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Installation worked example](../../references/examples/installation.md).
- The task needs scoped memory search, a persistent goal, independent review, configuration scanning, worker control, learned-pattern review or editor installation: [Native memory, goals, specialists and runtime controls](../../references/runtime-platform.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).
- Discovering session, inventory, rule, council, scheduler, monitor, graph, evaluation, operator or domain-specific capabilities: [Extended capabilities and optional method library](../../references/runtime-expansion.md).

## Decision branches

- **When an existing managed source conflicts with the selected channel:** Report the conflicting identity and supported switch procedure instead of overwriting arbitrary directories.
- **When the target is an editor adapter (Cursor, Copilot, Gemini, Zed and the other adapter hosts):** Pass --root <project> and no --local or --github flag; there is no native inventory, so verify the adapter JSON (installed, conflicts, missing, outdated) and restart the host.

## Deliver and verify

- Installation outcome or precise blocker with host/source/scope and actual verification.
- Installation source/version, native host state and executable validation or precise failure.
- Changed files, including Claude shortcut files that appear as untracked repository files at project or local scope.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Repeated setup does not create duplicate registrations; an existing marketplace with another source stops without replacement.

## Stop and recover

- Dry run does not inspect host state and must not imply it did. No manual global-config edits or credentials embedded in commands.

## Example requests

- **Normal (apply):** Install just-vibe for Claude Code at user scope.
- **edge (apply):** Update a bundled installation after its original package cache was removed.
- **blocked (inspect):** Inspect installation prerequisites on a machine without a supported host executable.
