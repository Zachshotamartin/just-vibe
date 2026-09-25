---
name: github-fix-ci
description: "Diagnose failing Actions jobs and verify repairs Use for repairing a specific GitHub Actions failure; ci diagnoses provider-neutral logs."
---

# github-fix-ci

Diagnose failing Actions jobs and verify repairs

## Choose this workflow

Use for repairing a specific GitHub Actions failure; ci diagnoses provider-neutral logs.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; failed PR/check run and exact revision. Requires Actions logs and local checkout.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

- **Infer from evidence:** Resolve owner/repository and PR/issue/ref from links, remotes and supplied artifacts; inspect available account and head identity.
- **Reasonable default:** Prepare local text or analyze supplied evidence if remote access is absent; label its freshness.
- **Ask only when needed:** Ask only when repository/account/target ambiguity blocks the requested remote action; missing write access does not block local drafting.

Declared evidence requirements: `project.read`, `git.repo`, `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Repair the identified CI failure; no weakening checks to make them green.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Find the first causal failure, compare runner configuration and lockfiles, reproduce locally where feasible, patch, and validate before an authorized rerun/push.
2. Resolve run ID, attempt, job and head SHA; find the first causal failure and reproduce using the relevant workspace/runtime before patching.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.
4. Use the matching bundled evidence collector when available; read its result and limitations rather than treating exit zero as readiness. Revalidate identity before a dependent action.
## Technical method

- **Inspect:** Read the first failing step and run attempt at the relevant SHA; compare matrix OS, toolchain, event and permissions.
- **Method:** Reproduce the smallest matching environment; distinguish test failure from billing, quota, provisioning or credential failure.
- **Avoid misdiagnosis:** Re-running unchanged code cannot repair an account spending limit; hiding a matrix entry discards coverage.
- **Check the result:** Verify a new relevant run on the changed SHA, or explicitly retain pending remote evidence when local checks are all that ran.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [GitHub worked example](../../references/examples/github.md).
- Resolving check, deployment or migration identity: [Delivery evidence](../../references/scenarios/delivery-evidence.md).
- Dependencies, builds, secrets, hooks or privileged execution cross a trust boundary: [Dependency and execution provenance](../../references/security/supply-chain.md).

## Decision branches

- **When failure is external or a required secret is withheld on forks:** Report the environment cause and safe alternative; do not grant fork code privileged tokens.

## Deliver and verify

- Cause, focused changes, local evidence, and remote run status if actually exercised.
- Run/job/revision, causal log, focused fix and corrected-revision check status.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A genuine test regression is fixed; an infrastructure outage is distinguished from code failure.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not expose log secrets or loop costly reruns. Green status must refer to the corrected revision.

## Example requests

- **Normal (apply):** Fix the failing Actions check for this PR revision; reproduce the cause locally.
- **edge (apply):** Fix a matrix failure while another job was merely cancelled.
- **blocked (inspect):** Diagnose supplied Actions logs with no permission to rerun or push.
