---
name: vercel-build-fix
description: "Reproduce and repair failed deployment builds"
---

# vercel-build-fix

Reproduce and repair failed deployment builds

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; failed deployment, branch/revision, and build logs.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Repository/build configuration causing the failure; project settings changes require explicit target scope.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Locate the causal error, compare runtime/package manager/env-name differences, reproduce in a controlled local build, patch, and verify the affected build path.

## Deliver and verify

- Fix, root-cause explanation, local check results, and deployment verification if authorized.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A missing runtime dependency is resolved correctly; environment differences are not masked by hard-coded secret values.

## Stop and recover

- Do not deploy or alter production settings merely to test. Inaccessible logs limit the diagnosis explicitly.

## Example request

Repair the preview build failure using the supplied deployment logs.
