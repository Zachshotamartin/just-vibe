---
name: vite-chunks
description: "Investigate loading boundaries, duplicated modules, and chunks"
---

# vite-chunks

Investigate loading boundaries, duplicated modules, and chunks

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

## Deliver and verify

- Chunk graph explanation and optimization plan or authorized patch with loading evidence.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A split reduces the intended initial work; deep-link and lazy-load paths still resolve all required modules.

## Stop and recover

- Avoid arbitrary manual chunk rules without evidence. Report missing network traces rather than inventing loading improvements.

## Example request

Find duplicated dependencies and loading-boundary issues in these build artifacts.
