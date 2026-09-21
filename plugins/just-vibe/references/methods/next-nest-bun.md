# Next.js, NestJS and Bun runtime behavior

Use when: next.js, turbopack, nestjs, bun runtime.

Change a web build/runtime boundary with version-specific APIs and deployment constraints verified.

## Inspect first

- Next router/cache mode and server/client boundaries
- Nest provider scopes, guards and request context
- Bun/Node module APIs, native addons and bundler targets

## Method

1. Trace where data is fetched, cached and authorized. A cache key must include the relevant identity/scope or stay private to the request.
2. Keep server credentials and privileged modules out of client bundles; inspect actual generated artifacts when the boundary is uncertain.
3. For Nest, validate DTO input at the transport boundary and distinguish singleton/request/transient provider lifetimes.
4. For Bun/Turbopack migrations, test the exact runtime APIs, ESM/CJS behavior, environment substitution and production build; passing a dev server is insufficient.

## Failure cases

- A cached personalized response is served to another user.
- A singleton stores request-specific state.
- A Node-compatible development API is missing from the deployment runtime.

## Verification

- Test two-user cache separation and invalid input.
- Run clean production build/start and a failing dependency case.
- Verify browser hydration and route transitions after deployment-like startup.

## Worked scenario

A user-specific dashboard must not reuse another session’s cached response even when both visit the same URL.

## Version-sensitive primary references

- [nextjs.org](https://nextjs.org/docs/app/guides/caching) — Read the official source for the installed version before relying on a version-sensitive API.
- [docs.nestjs.com](https://docs.nestjs.com/fundamentals/injection-scopes) — Read the official source for the installed version before relying on a version-sensitive API.
- [bun.sh](https://bun.sh/docs/runtime/nodejs-apis) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
