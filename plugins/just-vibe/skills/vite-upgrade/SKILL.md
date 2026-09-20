---
name: vite-upgrade
description: "Upgrade Vite and plugins with compatibility and build checks"
---

# vite-upgrade

Upgrade Vite and plugins with compatibility and build checks

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

## Deliver and verify

- Upgrade patch, compatibility rationale, checks, and rollback steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Framework refresh and build both work; incompatible plugins are resolved or explicitly block the target version.

## Stop and recover

- No unrelated major upgrades. If a required peer is unsupported, stop before presenting a broken combination as complete.

## Example request

Upgrade to the specified Vite version and verify framework-plugin compatibility.
