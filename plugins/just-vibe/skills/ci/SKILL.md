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

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Repository CI behavior; GitHub-specific operations use the GitHub pack.

None by default. Plan artifacts may be saved when requested.

## Execute

- Locate the first meaningful failure, compare runner/local environments, distinguish code failure from infrastructure, and validate authorized workflow changes.
- Find the first causal failure in the job graph, compare effective runtime and lockfile inputs, and distinguish required failures from downstream cancellations.

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
- **edge (inspect):** Diagnose one failing matrix job without disabling the other jobs.
- **blocked (inspect):** Inspect supplied CI logs without runner access or triggering a rerun.
