---
name: github-fix-ci
description: "Diagnose failing Actions jobs and verify repairs"
---

# github-fix-ci

Diagnose failing Actions jobs and verify repairs

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [GitHub methods](../../references/packs/github.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; failed PR/check run and exact revision. Requires Actions logs and local checkout.

exact owner/repository and relevant issue/PR/ref; authenticated read access through an available connector or CLI for remote evidence. External writes require the requested operation, appropriate account permissions, and rechecking target state. Local preparation remains useful without write access.

Declared evidence requirements: `project.read`, `github.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Repair the identified CI failure; no weakening checks to make them green.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Find the first causal failure, compare runner configuration and lockfiles, reproduce locally where feasible, patch, and validate before an authorized rerun/push.

## Deliver and verify

- Cause, focused changes, local evidence, and remote run status if actually exercised.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A genuine test regression is fixed; an infrastructure outage is distinguished from code failure.

## Stop and recover

- Do not expose log secrets or loop costly reruns. Green status must refer to the corrected revision.

## Example request

Fix the failing Actions check for this PR revision; reproduce the cause locally.
