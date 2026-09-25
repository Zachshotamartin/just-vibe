---
name: github-issue
description: "Turn a report or request into an actionable issue draft Use to draft or explicitly create an issue; github-triage assesses existing reports."
---

# github-issue

Turn a report or request into an actionable issue draft

## Choose this workflow

Use to draft or explicitly create an issue; github-triage assesses existing reports.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **plan**. Plan or draft an issue locally; apply for explicitly requested creation or updates in a resolved repository. Reconcile uncertain submissions before retrying.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

- **Infer from evidence:** Resolve owner/repository and PR/issue/ref from links, remotes and supplied artifacts; inspect available account and head identity.
- **Reasonable default:** Prepare local text or analyze supplied evidence if remote access is absent; label its freshness.
- **Ask only when needed:** Ask only when repository/account/target ambiguity blocks the requested remote action; missing write access does not block local drafting.

Declared evidence requirements: `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Actionable issue draft; submit only when explicitly instructed to create/post it.

Inspect/plan: draft from available evidence without posting. Apply: create or update only the issue the user requested in the resolved repository; preserve prior submission identity and do not post duplicates after uncertain responses.

## Execute

1. Check templates and related issues, extract verified facts, include minimal reproduction or acceptance criteria, and redact sensitive logs.
2. Inspect repository templates, separate expected/actual behavior and include a minimal reproduction with sanitized logs and tested version.
3. All changes are owned by the user. Add no agent/model self-attribution, AI-generated signature, badge, or agent Co-authored-by trailer to commits, PRs, comments, release notes or messages. Use the existing user Git identity; preserve legitimate human attribution and required third-party notices.
## Technical method

- **Inspect:** Collect expected/actual behavior, minimal trigger, version, environment and redacted evidence.
- **Method:** Separate confirmed reproduction from hypothesis and define an observable acceptance condition.
- **Avoid misdiagnosis:** Pasting raw logs can expose tokens; an unverified root-cause claim can misdirect the eventual repair.
- **Check the result:** Ensure another developer can attempt the reproduction from the draft without private state or invented evidence.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [GitHub worked example](../../references/examples/github.md).
- The request needs proactive context warnings, detected checks, native editor events, GitHub epic coordination or configuration audit reports: [Context health, check presets, editor events and shared work](../../references/runtime-depth.md).

## Decision branches

- **When creation returns an uncertain result:** Search for the attempted issue using repository and distinctive content before retrying.

## Deliver and verify

- Title/body/appropriate metadata or created issue URL with verified contents.
- Reviewable issue body, target identity, duplicate check and created URL only when observed.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Unknown reproduction details remain questions; a submitted issue uses the specified repository and avoids accidental duplicates.
- Review newly prepared commit/PR/message text, including template or hook additions, for agent self-attribution before submission; verify the resulting artifact when available. Do not silently rewrite existing history or remove human credits.

## Stop and recover

- Do not invent severity or affected versions. After uncertain submission, search for the created issue before retrying.

## Example requests

- **Normal (plan):** Draft an issue for the supplied reproduction; do not submit it.
- **edge (apply):** Create a bug report after an earlier submission timed out.
- **blocked (inspect):** Draft an issue from incomplete reproduction evidence without posting it.
