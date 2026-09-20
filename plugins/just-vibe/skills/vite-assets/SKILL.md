---
name: vite-assets
description: "Fix asset paths, public files, base paths, and deployment paths"
---

# vite-assets

Fix asset paths, public files, base paths, and deployment paths

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; broken asset URLs, deployment base path, source assets, and target routes.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Imported/public assets, URL construction, and base-path handling; no asset redesign.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Trace source-to-output paths, compare dev/build resolution, repair assumptions, and test root, nested, and configured subpath access.

## Deliver and verify

- Asset-path patch and production-build/browser verification.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Images work under the intended subpath; hashed imports and public files retain their respective semantics.

## Stop and recover

- Do not hard-code a development origin or copy secret files into public output. Missing deployment evidence is stated separately.

## Example request

Fix images that work locally but fail when hosted under a subpath.
