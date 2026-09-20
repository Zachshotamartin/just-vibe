---
name: backend-auth
description: "Build or audit authentication and session behavior Use for identity/session lifecycle; backend-permissions handles what an identity may do."
---

# backend-auth

Build or audit authentication and session behavior

## Choose this workflow

Use for identity/session lifecycle; backend-permissions handles what an identity may do.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [Backend methods](../../references/packs/backend.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect for audits; apply for a specified implementation. Requires identity provider, session model, and recovery/logout requirements.

service source, data/interface contracts, framework/runtime versions, and test environment. Default apply operations target local code and isolated tests; live infrastructure/data mutations require their own requested scope.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Authentication and session lifecycle; resource authorization is separately checked by `backend-permissions`.

None by default. Plan artifacts may be saved when requested.

## Execute

- Trace login/session/refresh/logout, inspect token/cookie boundaries, use supported provider mechanisms, and test expired, revoked, and invalid credentials.
- Trace credential validation, issuer/audience/expiry, cookie/token storage and refresh/logout transitions using the actual supported provider contract.

## Decision branches

- **When session invalidation differs between stateless tokens and server sessions:** State the revocation window and verify the intended mechanism rather than promising immediate universal logout.

## Deliver and verify

- Authentication findings or implementation with lifecycle checks.
- Auth lifecycle, trust assumptions and expired/revoked/invalid-credential checks.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Logout/revocation invalidates the intended session; untrusted or expired tokens fail closed.

## Stop and recover

- Do not invent cryptography, log credentials, or mistake authentication for permission to access every resource.

## Example requests

- **Normal (inspect):** Audit session refresh, logout, and expired-token behavior.
- **edge (inspect):** Repair refresh behavior across concurrent browser tabs and expired sessions.
- **blocked (inspect):** Review auth configuration without credentials or live login attempts.
