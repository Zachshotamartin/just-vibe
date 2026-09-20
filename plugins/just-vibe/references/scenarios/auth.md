# Authentication scenarios

Use the branch matching the existing identity provider and session architecture. Read its current primary documentation before changing provider-specific behavior. Keep authentication, authorization and account recovery distinct. An audit produces findings; an implementation request authorizes the scoped code change without an extra planning-only stop.

## Browser cookie sessions

Trace where the session is created, rotated, stored, renewed and invalidated. Identify whether the browser reaches one origin or crosses origins. Choose cookie Domain/Path, Secure, HttpOnly and SameSite from the actual deployment and login redirects; do not relax them to conceal a CORS or proxy error. Trace CSRF protection for state-changing requests rather than assuming a cookie flag covers every supported flow. Rotate the session identifier on authentication and privilege changes. Avoid caching personalized responses across users.

Verify anonymous access, successful login, session fixation resistance, expired sessions, logout and another still-open tab. Test the actual reverse-proxy/HTTPS boundary. Record whether logout revokes only this session or all sessions and what an already-issued token can still do.

## OAuth/OIDC callback

Use the provider's maintained client and the registered redirect URI. Bind the callback to the initiating browser flow, enforce supported state/PKCE protections and validate the ID token using the provider's issuer, audience and key rotation behavior. OIDC nonce applies to the chosen flow; OAuth access tokens are not automatically identity assertions. Do not hand-roll token verification or accept arbitrary callback return URLs.

Exercise cancellation, provider denial, mismatched flow state, expired/replayed authorization codes, callback reload, missing browser state and the real proxy origin. Preserve a safe retry path without retrying a consumed code. Confirm where the user returns after login, using local allowlisted destinations. See [OAuth security best current practice](https://www.rfc-editor.org/rfc/rfc9700.html).

## Refresh races and revocation

Draw the sequence for two concurrent requests or browser tabs refreshing one session. Determine whether the provider rotates refresh tokens and what reuse signals mean. Coordinate refresh through the existing session owner; retry the original request at most under the resolved new credential. A client-local promise alone cannot coordinate multiple servers or tabs.

Test overlapping refresh, logout during refresh, a late success after logout, expired refresh credentials and network uncertainty after token rotation. Define which owner can publish the new session; a stale refresh must not log the user back in. Distinguish an authentication failure from a provider outage. Do not loop redirects or wipe unrelated user input on a transient failure.

## Password recovery and account linking

Reuse provider-supported recovery. Ensure reset links expire, are single-use, and cannot leak through logs, analytics or untrusted redirect destinations. Keep response behavior from exposing whether an account exists; verify the configured abuse controls. Decide whether resetting a password invalidates existing sessions according to the product's policy.

Account linking requires proof for the accounts being linked. Matching an email string alone is insufficient. Handle an already-linked identity, an unverified email and a changed provider email without transferring ownership silently.

## Deliverable

Show the relevant lifecycle, implementation or prioritized findings, the tested transitions and the remaining provider/deployment evidence. A local mock demonstrates the application's handling; it does not establish live-provider configuration or universal immediate revocation.
