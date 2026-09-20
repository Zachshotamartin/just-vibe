---
name: setup
description: "Install, diagnose, update, or remove just-vibe through native host plugin management."
---

# setup

Install, diagnose, update, or remove just-vibe through native host plugin management.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Installation methods](../../references/packs/installation.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for an installation request; target host, bundled source, --github or --local checkout, and Claude scope. A preview request uses the existing `--dry-run` behavior.

Node.js 22+ and the selected host CLI with native plugin support. Git is required only for --github. Use the bundled installer; preserve marketplace and scope checks.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Install/enable just-vibe through the selected host's plugin manager; no unrelated plugin, permission, hook, or integration changes.

Selected host plugin registration and its managed just-vibe payload directory only.

## Execute

1. Resolve scripts/installer.mjs relative to this installed plugin. Choose doctor for a status question, setup for an install request, update for a refresh request, and uninstall only for an explicit removal request.
2. Honor the host, bundled default / --github / --local source and Claude --scope user|project|local; project/local operations use the requested project directory. Never place tokens in commands or files.
3. For a requested preview append --dry-run and report conditional steps without claiming installed state was inspected. Preserve all native source/scope/inventory conflict checks.
4. After success, report actual native state and explain that changed skills load in a fresh conversation. Uninstall retains marketplace registration and persistent data. Do not bypass errors with global edits or cache deletion.

Task-specific method: Resolve host/scope, check prerequisites and marketplace identity, run the bundled installer, preserve conflict checks, verify result, and explain fresh-session loading requirements.

## Deliver and verify

- Installation outcome or precise blocker with host/source/scope and actual verification.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Repeated setup does not create duplicate registrations; an existing marketplace with another source stops without replacement.

## Stop and recover

- Dry run does not inspect host state and must not imply it did. No manual global-config edits or credentials embedded in commands.

## Example request

Check my just-vibe installation without changing it.
