---
name: security-authz
description: "Test access decisions and cross-user or cross-tenant exposure"
---

# security-authz

Test access decisions and cross-user or cross-tenant exposure

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; access matrix, endpoints/resources, roles/tenants, and authorized test identities.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Authorization bypass, object ownership, privilege escalation, and cross-tenant access.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace checks at server/data boundaries, compare alternate endpoints and methods, design negative cases, and execute only permitted isolated probes.

## Deliver and verify

- Access findings with safe reproduction and remediation/check proposals.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Direct object references cannot bypass tenant policy; privileged and ordinary roles are tested distinctly.

## Stop and recover

- Do not use unauthorized real accounts or retrieve private records as proof. Missing policy prevents judging ambiguous access as a confirmed vulnerability.

## Example request

Audit direct API access to another organization's records using isolated identities.
