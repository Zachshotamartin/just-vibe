---
name: security-authz
description: "Test access decisions and cross-user or cross-tenant exposure Use for permission bypass inspection; backend-permissions implements an accepted access matrix."
---

# security-authz

Test access decisions and cross-user or cross-tenant exposure

## Choose this workflow

Use for permission bypass inspection; backend-permissions implements an accepted access matrix.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Security methods](../../references/packs/security.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; access matrix, endpoints/resources, roles/tenants, and authorized test identities.

defined application boundary, authorized code/environment, relevant trust/access rules, and evidence sources. Default to defensive inspection; active tests use owned or explicitly authorized isolated targets. Minimize sensitive evidence and never print usable credentials.

- **Infer from evidence:** Resolve the requested surface, source/runtime version, reachable callers and actual trust/access boundaries.
- **Reasonable default:** Start with source analysis and bounded owned fixtures; treat scanner output as leads and preserve legitimate controls.
- **Ask only when needed:** Ask when target authorization or necessary trust semantics are unresolved before active probing; source inspection need not wait for production access.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Authorization bypass, object ownership, privilege escalation, and cross-tenant access.

No source changes in inspect/plan. Save only requested planning artifacts. A separately requested repair uses the relevant implementation workflow.

## Execute

1. Trace checks at server/data boundaries, compare alternate endpoints and methods, design negative cases, and execute only permitted isolated probes.
2. Test policy at server/data boundaries across direct IDs, alternate methods, exports and background tasks using synthetic identities and known allowed/denied cases.
## Technical method

- **Inspect:** Inspect identity derivation, subject/action/resource rules, tenant filters and indirect entry points.
- **Method:** Use the identity guide to trace object-level and function-level authorization, including mass assignment, exports and workers.
- **Avoid misdiagnosis:** Authentication middleware proves identity, not ownership; an admin test can bypass the same controls being evaluated.
- **Check the result:** Verify denied cross-user/cross-tenant requests cause no reads or writes and that legitimate access remains possible using isolated identities.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [Security worked example](../../references/examples/security.md).
- Identity, ownership, tenant isolation, replay or privilege changes affect the task: [Identity and authorization](../../references/security/identity.md).

## Decision branches

- **When policy itself is unspecified:** Separate demonstrated missing enforcement from an unresolved product permission decision.

## Deliver and verify

- Access findings with safe reproduction and remediation/check proposals.
- Subject/action/resource cases, enforcement paths and evidence-backed findings.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Direct object references cannot bypass tenant policy; privileged and ordinary roles are tested distinctly.

## Stop and recover

- Do not use unauthorized real accounts or retrieve private records as proof. Missing policy prevents judging ambiguous access as a confirmed vulnerability.

## Example requests

- **Normal (inspect):** Audit direct API access to another organization's records using isolated identities.
- **edge (inspect):** Audit an endpoint that hides buttons but accepts cross-tenant direct requests.
- **blocked (inspect):** Review source without real accounts or retrieving private records as proof.
