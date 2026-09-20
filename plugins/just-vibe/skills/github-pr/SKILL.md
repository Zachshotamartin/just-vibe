---
name: github-pr
description: "Prepare or create a PR with scope, evidence, and issue links"
---

# github-pr

Prepare or create a PR with scope, evidence, and issue links

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; exact head/base, repository, issue links, and requested draft/create action.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

Declared evidence requirements: `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

PR preparation or explicitly requested creation/update; no merge or unsolicited reviewer messaging.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect diff and checks, detect existing PRs, prepare accurate title/body, resolve push authorization if needed, and verify the submitted head/base.

## Deliver and verify

- PR draft or URL, summary, validation, and readiness status.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An existing matching PR is reused; a dirty local file absent from the pushed head is not described as part of the PR.

## Stop and recover

- Do not push unrelated commits or merge implicitly. Unknown creation results require deduplication before retry.

## Example request

Prepare a draft PR for this exact head/base; show validation gaps.
