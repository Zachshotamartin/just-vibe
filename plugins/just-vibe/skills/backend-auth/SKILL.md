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

- Identify the provider, session owner, trust boundaries and the actual request: audit or implementation. Trace login, refresh, logout and recovery across browser and server.
- Read only the matching cookie-session, OAuth callback, refresh-race or recovery scenario. Use the supported provider mechanism, implement the requested boundary and verify the relevant transitions.

## Read when relevant

- Working on cookie sessions, callbacks, refresh or recovery: [Authentication scenarios](../../references/scenarios/auth.md).

## Decision branches

- **When browser cookie sessions carry authentication:** Resolve cookie scope, proxy/HTTPS behavior, CSRF protection, session rotation and logout semantics.
- **When OAuth/OIDC callbacks establish a session:** Bind the flow to the initiating browser, enforce the supported state/PKCE/nonce contract, and validate identity through the provider client.
- **When refresh and logout can overlap across tabs or workers:** Choose the session owner and stale-result rule; test rotation/reuse, expired credentials and late refresh after logout.
- **When recovery or account linking changes access:** Verify single-use/expiry, ownership proof, abuse controls and the intended existing-session invalidation.

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
