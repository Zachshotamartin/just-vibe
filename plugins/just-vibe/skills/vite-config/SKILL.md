---
name: vite-config
description: "Audit aliases, plugins, build options, and environment handling"
---

# vite-config

Audit aliases, plugins, build options, and environment handling

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; configuration files, intended behavior, and observed issue.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Aliases, plugins/order, build targets, server options, and environment handling.

None by default. Plan artifacts may be saved when requested.

## Execute

- Read effective configuration sources and version compatibility, trace conflicting options, compare development/production behavior, and propose focused corrections.

## Deliver and verify

- Configuration findings, reasoning, and optional authorized patch.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A TypeScript-only alias missing at runtime is identified; a version-unsupported option is not recommended.

## Stop and recover

- Do not execute arbitrary config code during read-only inspection without considering its side effects. Missing build evidence remains unknown.

## Example request

Audit aliases and plugin order for the installed Vite version.
