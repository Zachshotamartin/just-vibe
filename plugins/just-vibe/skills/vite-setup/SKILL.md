---
name: vite-setup
description: "Configure Vite for the framework and project requirements"
---

# vite-setup

Configure Vite for the framework and project requirements

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; framework, language, project location, deployment shape, and dependency constraints.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Vite configuration and required scripts/integration; no app redesign or unrelated toolchain replacement.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect existing setup, choose compatible plugins, configure development/build/preview scripts, preserve existing source, and validate basic development and production paths.

## Deliver and verify

- Working setup, dependency/config changes, usage, and check results.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The existing app builds; deploying under the requested base path resolves assets correctly.

## Stop and recover

- Do not overwrite an existing project with a template. Respect no-new-dependency constraints and unsupported framework combinations.

## Example request

Set up Vite for this existing React app without replacing source files.
