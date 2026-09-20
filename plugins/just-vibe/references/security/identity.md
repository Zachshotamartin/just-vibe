# Identity, authorization and business invariants

Read [authentication scenarios](../scenarios/auth.md) for cookie lifecycle, OAuth/OIDC callbacks, refresh races and recovery. This guide covers trust decisions around those flows. Match provider/framework version before changing defaults.

## Object and function authorization — CWE-639 / CWE-862 / CWE-863

Derive actor/tenant identity from validated server context and enforce subject/action/resource policy on every reachable path. Check detail endpoints, lists, bulk exports, downloads, alternate HTTP methods, workers and administrative actions. An unpredictable identifier reduces guessing but does not enforce ownership.

```python
# Unsafe: authenticated callers can select another tenant's invoice.
row = db.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,)).fetchone()
# Tenant-scoped example; actor/action policy may impose additional constraints.
row = db.execute(
    "SELECT * FROM invoices WHERE id = ? AND tenant_id = ?",
    (invoice_id, authenticated_tenant_id),
).fetchone()
```

Use synthetic identities A and B, including overlapping object IDs and distinct roles. Verify forbidden attempts produce no sensitive output or side effect and legitimate access still succeeds. Choose 403 versus non-disclosing 404 according to the established API policy. [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## Session and token verification — CWE-287 / CWE-384

Trace session creation, rotation on authentication/privilege change, expiration and invalidation. Distinguish decoding from verifying a signed token. Use the maintained provider client and enforce expected algorithm/key source, issuer, audience and time claims under its supported contract. Never fetch arbitrary key URLs from untrusted token headers. Account linking needs proof for both identities; a matching email string is not sufficient.

Test forged/expired/wrong-audience tokens, a fixed pre-login session, refresh overlap and a stale refresh completing after logout. Some systems cannot immediately revoke already-issued access tokens; report the actual guarantee and remaining lifetime rather than claiming universal revocation.

## Browser credentials, CSRF and CORS — CWE-352 / CWE-942

Determine whether the browser automatically sends credentials and how a cross-origin request could reach a state-changing action. Apply the framework's supported CSRF mechanism and origin policy to that flow. HttpOnly limits script access to cookies; it does not prevent CSRF. SameSite behavior depends on site boundaries and supported redirects, and CORS governs browser response access rather than all request delivery. A stateless backend can still accept ambient cookies and require CSRF protection.

Check an authenticated legitimate submission and a request lacking the required token/origin under a synthetic browser context. Cross-origin access should be constrained to the established trusted origins with deliberate credential behavior. Do not disable CSRF globally or use wildcard credential policies to fix a frontend error. [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

## Mass assignment and privilege transitions — CWE-915 / CWE-269

Separate writable user fields from server-owned roles, prices, tenant IDs, approval flags and ownership. Construct an allowlisted update object rather than spreading request data into a model. Check create, update, bulk operations and nested objects. An admin action needs the correct administrative scope, plus server-side enforcement of any reauthentication requirement.

Test a legitimate profile edit containing an extra `role` or `tenantId` field: the privileged attribute must not change. A schema that accepts a string proves no authority to choose that value.

## Passwords, reset and cryptographic usage — CWE-916 / CWE-330

Use supported password-hashing and verification APIs with current parameters appropriate to the deployment budget; do not invent a hash construction or reuse fast checksums for passwords. Generate authentication/reset tokens with a cryptographic random source and define expiry, single use and storage. Keep login/recovery responses from needlessly exposing account existence and bound abuse without preventing legitimate recovery. Review key storage, rotation and nonce requirements for the actual cryptographic library/protocol rather than making universal algorithm substitutions. [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Replay, races and business-logic abuse — CWE-362 / CWE-841

Write the business invariant first: one charge per operation, nonnegative stock, authorized refund amount or monotonic approval state. A valid signature or authenticated request can still be replayed or raced. Use the [backend concurrency/idempotency methods](../packs/backend.md) and [webhook methods](../packs/api.md) to align durable identity, transactions and uncertain external outcomes.

Test two competing valid operations through separate workers, a duplicate after timeout and a crash after an external effect. Verify both effect count and resulting durable state. Disabling the entire operation is not a successful repair when legitimate behavior is required.
