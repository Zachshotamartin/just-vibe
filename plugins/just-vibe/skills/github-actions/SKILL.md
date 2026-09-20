---
name: github-actions
description: "Improve workflows, caching, permissions, and job structure Use to implement requested workflow changes; github-fix-ci repairs one failed run."
---

# github-actions

Improve workflows, caching, permissions, and job structure

## Choose this workflow

Use to implement requested workflow changes; github-fix-ci repairs one failed run.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; workflow goal, event model, runtime constraints, and existing workflows.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

- **Infer from evidence:** Resolve owner/repository and PR/issue/ref from links, remotes and supplied artifacts; inspect available account and head identity.
- **Reasonable default:** Prepare local text or analyze supplied evidence if remote access is absent; label its freshness.
- **Ask only when needed:** Ask only when repository/account/target ambiguity blocks the requested remote action; missing write access does not block local drafting.

Declared evidence requirements: `project.read`, `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Workflow files, least-required permissions, caching, concurrency, and job structure; no repository secret/admin changes implicitly.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Map each event/ref, actor trust level, token permission and artifact producer/consumer before editing the workflow. Inspect the pinned action/runtime versions and repository policy; consult current primary documentation for changed platform behavior.
2. Keep untrusted PR text out of executable shell source and separate privileged metadata work from untrusted code execution. Validate artifact origin across workflow boundaries and define minimum job permissions.
3. Design job dependencies, cache identity and cancellation by effect: cancelling an obsolete test run differs from interrupting a release halfway through publication. Prevent overlapping destructive jobs without hiding failures or sharing artifacts across untrusted scopes.
4. Validate syntax plus representative trusted/untrusted event paths. Verify required check names remain reachable for applicable branches and that skipped/conditional jobs do not accidentally report an untested release as ready. Describe changes without agent self-attribution.
5. Use the matching bundled evidence collector when available; read its result and limitations rather than treating exit zero as readiness. Revalidate identity before a dependent action.
## Technical method

- **Inspect:** Inspect event, checked-out ref, job permissions, secret access, interpolation, action pins and artifact producers.
- **Method:** Keep untrusted contribution code outside privileged jobs; pass event values as data and scope caches/artifacts by trust and content identity.
- **Avoid misdiagnosis:** pull_request_target or workflow_run plus untrusted checkout/artifacts can cross a privilege boundary even if the workflow file is trusted.
- **Check the result:** Trace one fork contribution and one trusted release end to end; check that neither untrusted shell text nor poisoned artifacts reach privileged execution.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [GitHub worked example](../../references/examples/github.md).
- Resolving check, deployment or migration identity: [Delivery evidence](../../references/scenarios/delivery-evidence.md).
- Dependencies, builds, secrets, hooks or privileged execution cross a trust boundary: [Dependency and execution provenance](../../references/security/supply-chain.md).

## Decision branches

- **When pull_request_target or workflow_run consumes attacker-controlled code/artifacts:** Separate privileged metadata work from untrusted execution and validate artifact origin.

## Deliver and verify

- Workflow changes, event/permission rationale, and validation coverage.
- Trigger/permission matrix, job graph, cache keys and trusted/untrusted scenario checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Untrusted fork contributions do not gain secret-bearing privileged execution; cache invalidation follows dependency changes.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Missing remote execution remains unverified. Do not substitute a successful YAML parse for a working Actions run.

## Example requests

- **Normal (apply):** Improve workflow caching and permissions while preserving fork-PR checks.
- **edge (apply):** Add a release workflow without exposing secrets to fork pull requests.
- **blocked (inspect):** Review a workflow from YAML only; distinguish syntax validation from a successful runner execution.
