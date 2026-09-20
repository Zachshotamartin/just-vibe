---
name: github-pr
description: "Prepare or create a PR with scope, evidence, and issue links Use for remote PR preparation or creation; pr writes a local description only."
---

# github-pr

Prepare or create a PR with scope, evidence, and issue links

## Choose this workflow

Use for remote PR preparation or creation; pr writes a local description only.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan; exact head/base, repository, issue links, and requested draft/create action.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

Declared evidence requirements: `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

PR preparation or explicitly requested creation/update; no merge or unsolicited reviewer messaging.

None by default. Plan artifacts may be saved when requested.

## Execute

- Resolve owner/repository, fork owner, head branch/SHA and intended base branch/SHA. Inspect the merge-base diff and existing matching PRs; distinguish local uncommitted work, local unpushed commits and the actual remote head.
- Prepare the title/body from the candidate diff and relevant checks. Explain the trigger, changed behavior and verification limits. Follow the repository template without adding agent attribution, signatures or agent Co-authored-by text.
- Create or update only when the exact remote action is authorized in the session; otherwise finish the concrete draft. Before a retry after timeout, query the exact head/base for an already-created PR so an uncertain response cannot create a duplicate.
- Re-read the resulting PR identity and head/base. Checks for an older SHA do not establish readiness of the current head; if it changed during review, report that and validate the new candidate before claiming readiness.
- Use the matching bundled evidence collector when available; read its result and limitations rather than treating exit zero as readiness. Revalidate identity before a dependent action.

## Read when relevant

- Resolving check, deployment or migration identity: [Delivery evidence](../../references/scenarios/delivery-evidence.md).

## Decision branches

- **When a PR already exists for the intended head/base:** Reuse its identity and avoid duplicate creation; recheck head SHA before reporting readiness.

## Deliver and verify

- Draft or verified PR URL, head/base identity, change summary, checks attached to their tested SHA and explicit readiness limits.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- An existing matching PR is reused; a dirty local file absent from the pushed head is not described as part of the PR.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not push unrelated commits or merge implicitly. Unknown creation results require deduplication before retry.

## Example requests

- **Normal (plan):** Prepare a draft PR for this exact head/base; show validation gaps.
- **edge (plan):** Prepare a PR from a fork whose branch name also exists upstream.
- **blocked (inspect):** Draft a PR without push permission; separate local changes from the remote head.
