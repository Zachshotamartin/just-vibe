---
name: ci
description: "Diagnose or improve continuous integration Use for CI diagnosis across providers; github-fix-ci handles GitHub run identity and requested repairs."
---

# ci

Diagnose or improve continuous integration

## Choose this workflow

Use for CI diagnosis across providers; github-fix-ci handles GitHub run identity and requested repairs.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect for diagnosis; apply for requested fixes. Requires workflow files and relevant runner logs.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Repository CI behavior; GitHub-specific operations use the GitHub pack.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: edit the requested local implementation and perform relevant bounded checks while preserving unrelated work. Live data changes, remote actions and paid jobs require their resolved target and existing session authorization.

## Execute

1. Locate the first meaningful failure, compare runner/local environments, distinguish code failure from infrastructure, and validate authorized workflow changes.
2. Find the first causal failure in the job graph, compare effective runtime and lockfile inputs, and distinguish required failures from downstream cancellations.
## Technical method

- **Inspect:** Inspect run identity, first causal failure, matrix, caches, tool versions and event permissions.
- **Method:** Reproduce the failing boundary and preserve unrelated coverage; route GitHub-specific trust issues to its Actions guide.
- **Avoid misdiagnosis:** Disabling tests or broadening secrets access can make CI green while weakening correctness or security.
- **Check the result:** Run the relevant local check as bounded local execution and verify a matching remote run when available, distinguishing infrastructure blockers from code defects; use existing logs when no local run is possible.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).


## Decision branches

- **When logs show a provider outage rather than changed-code failure:** Preserve evidence and recommend a bounded rerun without weakening checks.

## Deliver and verify

- Root-cause evidence or focused patch, local checks, and remaining remote validation.
- Run/revision identity, causal log excerpt, environment difference and remaining verification.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A cache-related failure is not hidden by ignoring errors; unrelated matrix jobs remain intact.

## Stop and recover

- Do not rerun costly jobs or change organization secrets without the relevant request. Report inaccessible logs explicitly.

## Example requests

- **Normal (inspect):** Diagnose the failed matrix job from these logs without rerunning it.
- **edge (apply):** Fix the Jenkins pipeline's failing Node 24 matrix stage without disabling the other stages.
- **blocked (inspect):** Inspect supplied CI logs without runner access or triggering a rerun.
