---
name: security-config
description: "Review application, container, and deployment configuration Use for effective security-relevant settings; vercel-audit is a deployment-specific configuration comparison."
---

# security-config

Review application, container, and deployment configuration

## Choose this workflow

Use for effective security-relevant settings; vercel-audit is a deployment-specific configuration comparison.

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
- Compare declared and effective settings for the exact environment, inspect trust boundaries and distinguish local development exceptions from public production exposure.

## Decision branches

- **When effective deployment configuration is unavailable:** Report source-established risks conditionally instead of asserting the live setting.

## Deliver and verify

- Configuration findings with target-specific fixes and validation steps.
- Setting/environment/evidence/impact table and focused remediation.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Public debug exposure is identified; intentionally local development settings are not mislabeled as production incidents.

## Stop and recover

- No infrastructure edits or broad hardening that breaks required behavior. Unknown effective settings remain unknown.

## Example requests

- **Normal (inspect):** Audit production configuration without changing infrastructure settings.
- **edge (inspect):** Review debug exposure and cross-origin settings in separate dev and production configurations.
- **blocked (inspect):** Audit configuration files without infrastructure access or changing live settings.
