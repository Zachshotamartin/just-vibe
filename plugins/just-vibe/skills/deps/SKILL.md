---
name: deps
description: "Assess dependency updates and compatibility Use for dependency assessment or requested updates; vite-upgrade handles Vite-specific migration behavior and security-fix remediates a confirmed advisory."
---

# deps

Assess dependency updates and compatibility

## Choose this workflow

Use for dependency assessment or requested updates; vite-upgrade handles Vite-specific migration behavior and security-fix remediates a confirmed advisory.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; package scope, update goal, compatibility constraints, and registry access when needed. Apply for a requested update through the project's package manager.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Dependency health and upgrade proposals; a requested update uses apply mode and includes lockfiles.

Inspect/plan: inspect or propose; save requested artifacts only. Apply: edit the requested local implementation and perform relevant bounded checks while preserving unrelated work. Live data changes, remote actions and paid jobs require their resolved target and existing session authorization.

## Execute

1. Inspect manifests/resolution, check current release notes and advisories, identify peer/runtime constraints, and group changes by risk.
2. Read resolved versions and peer/runtime ranges; identify why each dependency exists and isolate direct changes from lockfile churn.
3. In apply mode, change the manifest through the project's package manager, then inspect the lockfile diff for unrelated churn before running checks.
## Technical method

- **Inspect:** Inspect manifests, lockfiles, direct/transitive ownership, advisory evidence and supported versions.
- **Method:** Separate security fixes from routine upgrades and assess API/engine/peer compatibility before changing the resolved graph.
- **Avoid misdiagnosis:** Forced audit fixes or ignored peer conflicts can replace one issue with a runtime incompatibility.
- **Check the result:** Inspect the resulting lockfile, run relevant behavior/build checks and retain unresolved advisories or inaccessible registry evidence.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Dependencies, builds, secrets, hooks or privileged execution cross a trust boundary: [Dependency and execution provenance](../../references/security/supply-chain.md).
- An available scanner or dependency advisory check can answer the scoped question: [Scanner selection and evidence](../../references/security/scanners.md).

## Decision branches

- **When an advisory has configuration-dependent exposure:** Trace actual reachable use and report that condition before recommending a breaking upgrade.

## Deliver and verify

- Prioritized recommendations or, in apply mode, the requested update with compatibility checks.
- Current/target versions, compatibility risks, advisory evidence and update checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A peer conflict is detected; updating one package does not silently churn unrelated dependency versions.

## Stop and recover

- Never treat latest as automatically best. Missing registry information is unknown, not proof of no vulnerabilities.

## Example requests

- **Normal (inspect):** Assess a compatible dependency update without changing files yet.
- **edge (apply):** Update one dependency with a conflicting peer and an unrelated dirty lockfile.
- **blocked (inspect):** Assess dependencies from the lockfile with unavailable advisory access.
