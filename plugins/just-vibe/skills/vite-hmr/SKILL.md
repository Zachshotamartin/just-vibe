---
name: vite-hmr
description: "Diagnose broken, slow, or inconsistent hot-module updates Use for broken development updates; react-effects handles lifecycle bugs visible during refresh."
---

# vite-hmr

Diagnose broken, slow, or inconsistent hot-module updates

## Choose this workflow

Use for broken development updates; react-effects handles lifecycle bugs visible during refresh.

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
- Follow file watcher to module graph to HMR connection and framework boundary; distinguish transport loss from invalidation and deliberate full reload.

## Decision branches

- **When updates fail only through a proxy or container:** Inspect websocket origin/port and mounted-path watching before relaxing host/filesystem protections.

## Deliver and verify

- Diagnosis and focused fix proposal; apply and validate when requested.
- Reproduction steps, failing HMR boundary and update/state-preservation checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A changed module updates correctly after remediation; unrelated state is preserved when the framework supports it.

## Stop and recover

- Running a dev server requires execution authorization. Do not disable host protections or broadly relax filesystem access as a default fix.

## Example requests

- **Normal (inspect):** Investigate why changes trigger full reloads and lose form state.
- **edge (inspect):** Diagnose refresh failing behind a reverse proxy while direct localhost works.
- **blocked (inspect):** Inspect HMR configuration without starting a dev server; identify needed browser evidence.
