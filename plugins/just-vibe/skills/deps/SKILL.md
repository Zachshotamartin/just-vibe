---
name: deps
description: "Assess dependency updates and compatibility"
---

# deps

Assess dependency updates and compatibility

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; package scope, update goal, compatibility constraints, and registry access when needed.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Dependency health and upgrade proposals; requested updates select apply mode and include lockfiles.

None by default. Plan artifacts may be saved when requested.

## Execute

- Inspect manifests/resolution, check current release notes and advisories, identify peer/runtime constraints, and group changes by risk.

## Deliver and verify

- Prioritized recommendations or authorized update with compatibility checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A peer conflict is detected; updating one package does not silently churn unrelated dependency versions.

## Stop and recover

- Never treat latest as automatically best. Missing registry information is unknown, not proof of no vulnerabilities.

## Example request

Assess a compatible dependency update without changing files yet.
