---
name: github-issue
description: "Turn a report or request into an actionable issue draft"
---

# github-issue

Turn a report or request into an actionable issue draft

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; bug/feature report, target repository, reproduction, and expected outcome.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

Actionable issue draft; submit only when explicitly instructed to create/post it.

None by default. Plan artifacts may be saved when requested.

## Execute

- Check templates and related issues, extract verified facts, include minimal reproduction or acceptance criteria, and redact sensitive logs.

## Deliver and verify

- Title/body/appropriate metadata or created issue URL with verified contents.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Unknown reproduction details remain questions; a submitted issue uses the specified repository and avoids accidental duplicates.

## Stop and recover

- Do not invent severity or affected versions. After uncertain submission, search for the created issue before retrying.

## Example request

Draft an issue for the supplied reproduction; do not submit it.
