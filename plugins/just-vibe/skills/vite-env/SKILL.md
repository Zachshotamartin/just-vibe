---
name: vite-env
description: "Check environment loading and exposure of server-only values Use for build mode, environment loading and client exposure; vercel-env checks deployment scope metadata."
---

# vite-env

Check environment loading and exposure of server-only values

## Choose this workflow

Use for build mode, environment loading and client exposure; vercel-env checks deployment scope metadata.

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
- Trace import.meta.env usage and configured envPrefix, inspect mode-specific files by names only, and separate build mode from NODE_ENV.

## Technical method

- **Inspect:** Inspect modes, envDir, public prefixes, define substitutions and client import paths using variable names.
- **Apply:** Trace whether the value is compiled into client output or read only by server code; keep mode distinct from NODE_ENV.
- **Avoid misdiagnosis:** Prefixing a secret with VITE_ makes it public; booleans read from env may be strings with surprising truthiness.
- **Check the result:** Build with a synthetic sentinel and inspect intended exposure and parsing without placing real secret values in reports.

## Read when relevant

- The task depends on framework defaults, middleware, RLS, server/client or deployment behavior: [Framework-specific review branches](../../references/security/frameworks.md).

## Decision branches

- **When a required secret is referenced by client code:** Move the privileged operation behind a server boundary instead of adding a client-exposed prefix.

## Deliver and verify

- Redacted environment map and exposure/missing-value findings.
- Name/consumer/mode/exposure table and evidence from a controlled built artifact.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Server-only credentials are not moved into client-exposed prefixes; development and production modes resolve the intended public configuration.

## Stop and recover

- Never print secret values. Secret rotation is a separate authorized action; configuration edits follow an explicit repair request.

## Example requests

- **Normal (inspect):** Check whether server-only configuration is exposed in the client bundle.
- **edge (inspect):** Diagnose a staging build made with a production NODE_ENV and a custom mode.
- **blocked (inspect):** Inspect environment references without reading secret values or building output.
