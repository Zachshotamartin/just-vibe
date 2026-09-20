---
name: vite-chunks
description: "Investigate loading boundaries, duplicated modules, and chunks Use to change lazy-loading/cache boundaries; vite-bundle first identifies heavy contributors."
---

# vite-chunks

Investigate loading boundaries, duplicated modules, and chunks

## Choose this workflow

Use to change lazy-loading/cache boundaries; vite-bundle first identifies heavy contributors.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; route/loading behavior, build artifacts, and chunk configuration.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Dynamic imports, shared chunks, duplicate modules, and loading boundaries.

None by default. Plan artifacts may be saved when requested.

## Execute

- Map entry/chunk relationships, inspect waterfalls and dependency duplication, evaluate cache/initial-load tradeoffs, and propose focused splitting changes.
- Map dynamic imports and shared chunks to representative navigation waterfalls; examine duplication, circular dependencies and cache invalidation costs.

## Technical method

- **Inspect:** Inspect dynamic imports, shared dependencies, manual chunk rules and module side effects.
- **Apply:** Split at meaningful usage boundaries and check initialization order and caching across releases.
- **Avoid misdiagnosis:** A smaller entry chunk can add serial requests or cause a stale HTML document to reference a deleted old chunk.
- **Check the result:** Test cold navigation, lazy routes and an older open page during deployment; define reload/recovery for missing chunks.

## Decision branches

- **When manual splitting changes execution order or creates a waterfall:** Verify module side effects and route transitions before accepting byte reductions.

## Deliver and verify

- Chunk graph explanation and optimization plan or authorized patch with loading evidence.
- Chunk/dependency map, request waterfall and relevant navigation checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A split reduces the intended initial work; deep-link and lazy-load paths still resolve all required modules.

## Stop and recover

- Avoid arbitrary manual chunk rules without evidence. Report missing network traces rather than inventing loading improvements.

## Example requests

- **Normal (inspect):** Find duplicated dependencies and loading-boundary issues in these build artifacts.
- **edge (inspect):** Split a heavy dashboard while preserving direct deep links and shared vendor initialization.
- **blocked (inspect):** Plan chunks without network traces; report loading benefits as hypotheses.
