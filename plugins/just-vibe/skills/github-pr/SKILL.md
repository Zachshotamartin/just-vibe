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

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan or draft locally when requested; apply when the user asks to create or update a PR in a resolved repository.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

- **Infer from evidence:** Resolve owner/repository and PR/issue/ref from links, remotes and supplied artifacts; inspect available account and head identity.
- **Reasonable default:** Prepare local text or analyze supplied evidence if remote access is absent; label its freshness.
- **Ask only when needed:** Ask only when repository/account/target ambiguity blocks the requested remote action; missing write access does not block local drafting.

Declared evidence requirements: `git.repo`, `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

PR preparation or explicitly requested creation/update; no merge or unsolicited reviewer messaging.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Resolve owner/repository, fork owner, head branch/SHA and intended base branch/SHA. Inspect the merge-base diff and existing matching PRs; distinguish local uncommitted work, local unpushed commits and the actual remote head.
2. Prepare the title/body from the candidate diff and relevant checks. Explain the trigger, changed behavior and verification limits. Follow the repository template without adding agent attribution, signatures or agent Co-authored-by text.
3. Create or update only when the exact remote action is authorized in the session; otherwise finish the concrete draft. Before a retry after timeout, query the exact head/base for an already-created PR so an uncertain response cannot create a duplicate.
4. Re-read the resulting PR identity and head/base. Checks for an older SHA do not establish readiness of the current head; if it changed during review, report that and validate the new candidate before claiming readiness.
5. Use the matching bundled evidence collector when available; read its result and limitations rather than treating exit zero as readiness. Revalidate identity before a dependent action.
## Technical method

- **Inspect:** Verify base/head repositories and SHAs, actual diff, template, related issues and check attempts.
- **Method:** Describe final behavior and validation for the pushed head; inspect an existing matching PR before retrying creation.
- **Avoid misdiagnosis:** A local green test can cover unstaged code absent from the PR; same branch names in forks identify different heads.
- **Check the result:** Re-read remote head and rendered body after requested submission; include only demonstrated checks and user-owned attribution.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [GitHub worked example](../../references/examples/github.md).
- Resolving check, deployment or migration identity: [Delivery evidence](../../references/scenarios/delivery-evidence.md).

## Decision branches

- **When a PR already exists for the intended head/base:** Reuse its identity and avoid duplicate creation; recheck head SHA before reporting readiness.
- **When the request is for local preparation or implementation:** Draft the requested title/body from the local diff without requiring remote credentials; resolve repository and head/base identity before creating or updating the requested PR.

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
