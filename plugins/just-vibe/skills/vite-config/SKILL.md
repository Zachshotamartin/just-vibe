---
name: vite-config
description: "Audit aliases, plugins, build options, and environment handling Use to inspect effective configuration; vite-hmr or vite-assets handles a known failure surface."
---

# vite-config

Audit aliases, plugins, build options, and environment handling

## Choose this workflow

Use to inspect effective configuration; vite-hmr or vite-assets handles a known failure surface.

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
- Resolve command, mode, root, envDir, aliases and plugin order from the actual invoked script; compare TypeScript resolution with bundler resolution.

## Technical method

- **Inspect:** Read effective command/mode, root/envDir, aliases, plugins, define replacements and server restrictions.
- **Apply:** Trace each disputed option to its consuming tool; reconcile TypeScript paths with actual bundler resolution.
- **Avoid misdiagnosis:** A config file can execute arbitrary imports; read-only inspection should not evaluate it just to discover values.
- **Check the result:** Check the relevant dev and production resolution paths, including case-sensitive filenames and browser-exposed replacements.

## Decision branches

- **When a config function branches on command or mode:** Assess each relevant branch statically before executing potentially side-effecting configuration.

## Deliver and verify

- Configuration findings, reasoning, and optional authorized patch.
- Effective configuration by invocation and unsupported/conflicting settings.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A TypeScript-only alias missing at runtime is identified; a version-unsupported option is not recommended.

## Stop and recover

- Do not execute arbitrary config code during read-only inspection without considering its side effects. Missing build evidence remains unknown.

## Example requests

- **Normal (inspect):** Audit aliases and plugin order for the installed Vite version.
- **edge (inspect):** Diagnose an alias that typechecks but fails in the production bundle.
- **blocked (inspect):** Inspect config source with no build permission; do not execute arbitrary imports.
