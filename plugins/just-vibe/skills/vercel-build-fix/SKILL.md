---
name: vercel-build-fix
description: "Reproduce and repair failed deployment builds Use for a failed Vercel build; vite-bundle handles size and splitting of a successful build."
---

# vercel-build-fix

Reproduce and repair failed deployment builds

## Choose this workflow

Use for a failed Vercel build; vite-bundle handles size and splitting of a successful build.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Vercel methods](../../references/packs/vercel.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; failed deployment, branch/revision, and build logs.

exact team/project/environment and deployment/revision when applicable; read access to relevant configuration/logs. Verify installed CLI/API support and framework behavior during implementation. Never print environment values or infer promotion authorization from a preview request.

Declared evidence requirements: `vercel.context`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Repository/build configuration causing the failure; project settings changes require explicit target scope.

Only the requested local changes; external actions require their exact action and target in session authorization.

## Execute

- Identify the failing deployment, SHA, environment and first causal build error. Compare repository/install root, build package, output path, runtime/package manager and resolved dependencies with the successful environment.
- Reproduce the failing boundary locally when possible using the same workspace command and versions. Check case sensitivity, hoisted undeclared dependencies, build-time environment names and generated-file assumptions before patching application behavior.
- Apply a focused fix and verify the corresponding build path. Keep local success separate from remote deployment verification; reuse the existing deployment/project identity and create a new deployment only when requested.
- Report the causal evidence, changed configuration/code, local result and the deployment/revision actually observed remotely. Redact values and do not download secrets as incidental diagnosis.

## Decision branches

- **When local build succeeds but deployment fails:** Reproduce the specific environment difference before changing application code or adding dependencies.

## Deliver and verify

- Fix, root-cause explanation, local check results, and deployment verification if authorized.
- Causal build boundary, environment comparison, patch and reproduction outcome.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A missing runtime dependency is resolved correctly; environment differences are not masked by hard-coded secret values.

## Stop and recover

- Do not deploy or alter production settings merely to test. Inaccessible logs limit the diagnosis explicitly.

## Example requests

- **Normal (apply):** Repair the preview build failure using the supplied deployment logs.
- **edge (apply):** Fix a deployment where an omitted runtime dependency exists only through workspace hoisting.
- **blocked (inspect):** Diagnose from a build log without a valid Vercel token; do not deploy to test.
