---
name: vite-upgrade
description: "Upgrade Vite and plugins with compatibility and build checks Use for a requested Vite version transition; deps handles general dependency selection."
---

# vite-upgrade

Upgrade Vite and plugins with compatibility and build checks

## Choose this workflow

Use for a requested Vite version transition; deps handles general dependency selection.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply for a requested upgrade; source/target version, framework/plugins, and runtime constraints.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Compatible Vite/toolchain upgrade and necessary config changes.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Read relevant migration notes, inspect plugin and Node compatibility, update controlled dependencies/lockfile, adjust deprecated behavior, and test development plus production build.
- Check target migration notes and framework-plugin/Node compatibility, update only the required graph and compare dev refresh, production output and preview behavior.

## Decision branches

- **When a required plugin has no compatible version:** Stop at that compatibility boundary and propose a supported intermediate target.

## Deliver and verify

- Upgrade patch, compatibility rationale, checks, and rollback steps.
- Version/peer matrix, configuration changes and dev/build/runtime checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Framework refresh and build both work; incompatible plugins are resolved or explicitly block the target version.

## Stop and recover

- No unrelated major upgrades. If a required peer is unsupported, stop before presenting a broken combination as complete.

## Example requests

- **Normal (apply):** Upgrade to the specified Vite version and verify framework-plugin compatibility.
- **edge (apply):** Upgrade Vite while retaining an older framework plugin until a supported replacement exists.
- **blocked (inspect):** Plan an upgrade with unavailable release-note access; do not guess removed options.
