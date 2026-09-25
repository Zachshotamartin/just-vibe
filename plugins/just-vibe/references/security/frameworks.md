# Framework-specific review branches

Select only the actual stack, reading its installed version and effective configuration. These branches focus review; they do not replace current provider documentation. Source links were consulted during the technical audit on 2026-09-20. A project's older version may have different defaults.

## React and Next.js

React text rendering normally escapes strings. Inspect raw HTML, scriptable URL handling and third-party rendering separately. A component hidden from unauthorized users does not secure the route/action it calls. For Next.js, enforce authentication and action/resource authorization at reachable server entry points and the data-access layer; middleware alone is not an authorization boundary (CVE-2025-29927 bypassed it through a crafted header); minimize data serialized into client props. Treat action arguments as untrusted even when normally produced by your own UI. Check cache identity and revalidation for personalized data; do not infer current cache defaults from another major version. [Next.js data security](https://nextjs.org/docs/app/guides/data-security).

Check one direct unauthorized server request plus a valid request, user A followed by user B through the same cached path, and raw HTML separately from a safe text child. For lifecycle, stale responses and hydration, read [React methods](../packs/react.md).

## Node.js and Express

Inspect middleware order: identity/authorization must apply to the actual route and method; raw webhook bodies must reach signature verification in the required representation. Set body/resource limits, centralize safe error responses and inspect session cookie/proxy behavior against real TLS termination. Broad `trust proxy` can change client IP/protocol assumptions used by rate limiting and cookies. Security headers are useful additional protection but do not establish authorization or safe query construction. [Express security practices](https://expressjs.com/en/advanced/best-practice-security.html).

Check alternate route methods, malformed bodies, an untrusted forwarded-header request under the deployment topology and a controlled error without stack/secret disclosure. Use fixed argv and supported parsers as described in [injection](injection.md).

## Django and Django REST Framework

Inspect middleware and view exemptions, authentication backends, queryset ownership filters and per-object permissions. Template autoescaping does not protect deliberate safe-marking, raw HTML or every JavaScript/URL context. Use ORM binding and inspect `raw`, raw SQL and dynamic expressions separately. Verify effective `DEBUG`, host/proxy configuration, cookie flags and CSRF on the supported request flow. An authenticated view does not automatically restrict a queryset to the user's tenant. [Django security documentation](https://docs.djangoproject.com/en/stable/topics/security/).

Compare a normal rendered string with a safe-marked input; call a detail/list/export view using a second synthetic tenant; test CSRF enforcement on a session-authenticated write. Do not add obsolete settings from an unrelated Django release.

## FastAPI and Python services

Schema validation establishes shape, not permission. Inspect security dependencies at the router and operation actually invoked, including omitted dependencies on alternate endpoints. Verify the token using the chosen provider/library, then enforce resource policy. Review response models/serializers for accidental private-field exposure. Blocking synchronous work inside an async endpoint can stall the event loop; use the framework's documented execution mechanism rather than assuming `async` makes a dependency nonblocking. [FastAPI security](https://fastapi.tiangolo.com/tutorial/security/).

Test a validly shaped unauthorized request, omitted/wrong credentials and a private field in the internal object. Check cancellation/cleanup around resources using [language and runtime methods](../scenarios/language-review.md).

## Spring Boot and Spring Security

Read the effective `SecurityFilterChain`, matcher order, method security activation, principal mapping and custom filters. Verify intended method checks run through the actual call path. Align transaction boundaries and authorization with mutable resource state. CSRF requirements depend on browser credential behavior, not merely whether sessions are disabled. Review CORS and cookie-based token arrangements before changing CSRF configuration. [Spring CSRF documentation](https://docs.spring.io/spring-security/reference/features/exploits/csrf.html).

Test anonymous, authenticated-but-forbidden and permitted requests for each affected matcher, including a more specific path that could be shadowed by a broad rule. Inspect binding to entities for over-posted privileged fields and use explicit DTOs/allowed fields.

## PostgreSQL, RLS and managed service roles

Inspect the role that the application connection really uses. Owners, superusers and bypass roles can invalidate a policy test. Test as a non-owner application role, or apply `ALTER TABLE ... FORCE ROW LEVEL SECURITY` so the owner is also subject to policies; superusers and `BYPASSRLS` roles always bypass. Check read predicates, write checks and whether functions/views execute with different rights. Reset tenant context when returning pooled connections; transaction-scoped context may be preferable where supported. [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

Exercise all affected operations using the intended non-bypass role, then alternate tenants on a reused connection. Review indirect access through jobs, exports and service clients. Reuse [database methods](../packs/database.md) for transaction, migration and locking evidence.

## Vite, Vercel and client/server configuration

Track variable names from build environment to emitted browser assets or server-only runtime lookup. `VITE_` exposure is deliberate public configuration, not secure secret storage. Other public prefixes and define replacements need the same boundary review. Preview, production and branch scopes may differ; a settings update need not change an existing deployment's compiled bytes. Inspect actual deployment identity and platform protection before interpreting a response. [Vite environment rules](https://vite.dev/guide/env-and-mode), [Vercel environments](https://vercel.com/docs/deployments/environments).

Build with synthetic sentinels to check intended exposure, verify a direct nested route and asset MIME type, and distinguish protected preview responses from application failures. Do not download secrets just to compare variable presence.
