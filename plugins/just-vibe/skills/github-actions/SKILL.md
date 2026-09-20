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

Declared evidence requirements: `project.read`, `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Workflow files, least-required permissions, caching, concurrency, and job structure; no repository secret/admin changes implicitly.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Inspect triggers and trust boundaries, design job dependencies, choose documented action versions, implement safe cache/artifact handling, and validate syntax and scenarios.
- Trace event, ref and permissions through every job; pin external code deliberately and keep untrusted PR data out of shell source.

## Decision branches

- **When pull_request_target or workflow_run consumes attacker-controlled code/artifacts:** Separate privileged metadata work from untrusted execution and validate artifact origin.

## Deliver and verify

- Workflow changes, event/permission rationale, and validation coverage.
- Trigger/permission matrix, job graph, cache keys and trusted/untrusted scenario checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Untrusted fork contributions do not gain secret-bearing privileged execution; cache invalidation follows dependency changes.

## Stop and recover

- Missing remote execution remains unverified. Do not substitute a successful YAML parse for a working Actions run.

## Example requests

- **Normal (apply):** Improve workflow caching and permissions while preserving fork-PR checks.
- **edge (apply):** Add a release workflow without exposing secrets to fork pull requests.
- **blocked (inspect):** Review a workflow from YAML only; distinguish syntax validation from a successful runner execution.
