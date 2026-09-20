---
name: github-release
description: "Prepare a release from merged changes, tags, and issues Use for an explicitly scoped GitHub release; release drafts notes and readiness criteria."
---

# github-release

Prepare a release from merged changes, tags, and issues

## Choose this workflow

Use for an explicitly scoped GitHub release; release drafts notes and readiness criteria.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan release notes and artifacts; apply for requested local release preparation or publication.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

- **Infer from evidence:** Resolve owner/repository and PR/issue/ref from links, remotes and supplied artifacts; inspect available account and head identity.
- **Reasonable default:** Prepare local text or analyze supplied evidence if remote access is absent; label its freshness.
- **Ask only when needed:** Ask only when repository/account/target ambiguity blocks the requested remote action; missing write access does not block local drafting.

Resolve any task-specific tools, target identity and evidence before dependent actions. No external connection is assumed.

## Scope

GitHub release preparation; tags, asset uploads, and publication require those explicit actions.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: make the requested changes or execute the requested operation within its resolved target and limits. Local preparation does not authorize live, remote, destructive or paid actions; existing explicit session authorization still applies.

## Execute

1. Verify commit range and existing releases, compile notes, inspect compatibility/checks, validate asset identities, and execute authorized publication once.
2. Resolve tag and commit immutably, verify asset hashes and existing release state, and reconcile partial uploads before publication or retry.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.
## Technical method

- **Inspect:** Resolve tag commit, release range, candidate asset hashes, existing uploaded assets and verification records.
- **Method:** Assemble notes from the actual range and reconcile partial uploads before retrying; preserve tag and artifact identity.
- **Avoid misdiagnosis:** Reusing an asset name for different bytes or moving a tag silently changes what users receive.
- **Check the result:** Check published tag and asset identities after authorized release actions; failed/missing assets remain incomplete rather than released.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [GitHub worked example](../../references/examples/github.md).
- Dependencies, builds, secrets, hooks or privileged execution cross a trust boundary: [Dependency and execution provenance](../../references/security/supply-chain.md).

## Decision branches

- **When the tag exists at a different commit or asset name has different content:** Stop and report the conflict rather than replacing published identity.
- **When the request is for local preparation or implementation:** Prepare the requested notes/artifact manifest locally; publish only the requested release at the resolved repository/tag, reconciling uncertain prior submissions before retrying.

## Deliver and verify

- Release draft or verified URL/tag/assets, with readiness and migration notes.
- Tag/SHA, release state, asset names/hashes and observed publication result.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Notes exclude unmerged unrelated changes; a duplicate version is detected before publication.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not overwrite tags or publish missing/unchecked binaries. On partial failure, report which assets or release state already exist.

## Example requests

- **Normal (plan):** Prepare a release from the specified refs; do not create a tag or publish.
- **edge (plan):** Resume a release after one of three assets uploaded successfully.
- **blocked (inspect):** Prepare a release with missing verified binaries; do not publish placeholders.
