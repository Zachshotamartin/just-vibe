---
name: vite-env
description: "Check environment loading and exposure of server-only values"
---

# vite-env

Check environment loading and exposure of server-only values

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vite methods](../../references/packs/vite.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; build mode, expected variable names, environment files, and exposure policy.

project manifests, lockfile, Vite/framework/plugin versions, and existing build scripts. Verify current version-specific documentation when changing configuration. Apply-mode checks may generate build/cache artifacts; inspect mode uses existing evidence.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Load precedence, prefixes, build-time replacement, and client/server separation.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect variable references and configuration names, trace which mode supplies them, inspect existing generated bundles for exposure when available, and recommend narrow corrections.

## Deliver and verify

- Redacted environment map and exposure/missing-value findings.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Server-only credentials are not moved into client-exposed prefixes; development and production modes resolve the intended public configuration.

## Stop and recover

- Never print secret values. Secret rotation is a separate authorized action; configuration edits follow an explicit repair request.

## Example request

Check whether server-only configuration is exposed in the client bundle.
