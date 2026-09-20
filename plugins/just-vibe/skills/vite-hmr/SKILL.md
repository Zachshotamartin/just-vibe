---
name: vite-hmr
description: "Diagnose broken, slow, or inconsistent hot-module updates"
---

# vite-hmr

Diagnose broken, slow, or inconsistent hot-module updates

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; affected file/component, development environment, and HMR logs or reproduction.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Watcher events, module invalidation, framework refresh, and proxy/network transport.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace file change to browser update, inspect plugin boundaries and duplicate modules, distinguish full reload from hot replacement, and localize the failure.

## Deliver and verify

- Diagnosis and focused fix proposal; apply and validate when requested.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A changed module updates correctly after remediation; unrelated state is preserved when the framework supports it.

## Stop and recover

- Running a dev server requires execution authorization. Do not disable host protections or broadly relax filesystem access as a default fix.

## Example request

Investigate why changes trigger full reloads and lose form state.
