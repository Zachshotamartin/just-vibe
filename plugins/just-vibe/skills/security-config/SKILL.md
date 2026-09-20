---
name: security-config
description: "Review application, container, and deployment configuration"
---

# security-config

Review application, container, and deployment configuration

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; app/container/deployment configuration and exact environment.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Debug settings, permissions, network exposure, cookies/headers, transport assumptions, and default credentials.

None by default. Plan artifacts may be saved when requested.

## Execute

- Compare effective configuration with intended boundaries, distinguish dev from production requirements, trace high-impact settings, and verify available deployment evidence.

## Deliver and verify

- Configuration findings with target-specific fixes and validation steps.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Public debug exposure is identified; intentionally local development settings are not mislabeled as production incidents.

## Stop and recover

- No infrastructure edits or broad hardening that breaks required behavior. Unknown effective settings remain unknown.

## Example request

Audit production configuration without changing infrastructure settings.
