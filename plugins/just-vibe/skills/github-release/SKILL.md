---
name: github-release
description: "Prepare a release from merged changes, tags, and issues"
---

# github-release

Prepare a release from merged changes, tags, and issues

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; repository, previous/target refs, version, assets, and requested publication state.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

GitHub release preparation; tags, asset uploads, and publication require those explicit actions.

None by default. Plan artifacts may be saved when requested.

## Execute

- Verify commit range and existing releases, compile notes, inspect compatibility/checks, validate asset identities, and execute authorized publication once.

## Deliver and verify

- Release draft or verified URL/tag/assets, with readiness and migration notes.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Notes exclude unmerged unrelated changes; a duplicate version is detected before publication.

## Stop and recover

- Do not overwrite tags or publish missing/unchecked binaries. On partial failure, report which assets or release state already exist.

## Example request

Prepare a release from the specified refs; do not create a tag or publish.
