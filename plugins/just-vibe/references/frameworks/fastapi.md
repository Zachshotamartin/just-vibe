# FastAPI services

Use for a confirmed FastAPI project. Establish FastAPI, Starlette, Pydantic, HTTPX and database-driver versions from the lockfile. Inspect application creation, lifespan, routers, dependency overrides, middleware and repository tests. Do not replace the existing architecture with a sample layout.

## Request and resource lifecycle

Trace the operation from its mounted router through dependencies and response serialization. Validate external shape with the installed Pydantic API, then perform object-level authorization against current data. A valid bearer token or schema does not establish ownership. Keep input, persistence and output models distinct where they expose different fields; test that password hashes, internal flags and other private fields never enter responses.

Create application-wide pools in lifespan and release them at shutdown. Give each request its own session/transaction as required by the driver. A dependency using yield owns cleanup; preserve the installed version's behavior for streaming responses and background work. Do not pass a request-scoped session to work that outlives the request. A durable job needs its own resources and retry/idempotency contract.

An async endpoint must not directly call blocking HTTP/database/CPU-heavy code. A synchronous helper called directly from async code does not automatically move to the framework thread pool. Use the project's async client or documented offloading approach. Propagate cancellation; bound connect/read/pool timeouts and close streaming responses on failure.

Keep the transaction boundary explicit in the service layer. Commit once for the intended business operation, roll back expected failures, and enforce unique invariants in the database. If a side effect must follow a commit reliably, use an outbox. Preserve error distinctions: unauthenticated, forbidden, absent resource, validation failure and conflict need the documented API contract.

## Tests and failure controls

- Exercise the mounted application, not only a router function. Include an alternate route that could omit the authorization dependency.
- Use HTTPX ASGITransport with an async test when verifying async database state. AsyncClient alone does not run ASGI lifespan; use the project's lifespan manager or context-managed TestClient where appropriate.
- Set dependency_overrides only for the test and clear them in finally/fixture teardown. Avoid replacing the authorization dependency in the test meant to verify authorization.
- Use two users/tenants and a private response field. Verify denied reads/writes and output filtering. Run a real database integration case for transaction and constraint behavior.
- Interrupt a streaming request and fail the database call; assert cleanup. Test startup failure and shutdown resource closure where lifecycle code changed.
- Compare generated OpenAPI and representative JSON for renamed fields, aliases, nullable/default semantics and status codes. Pydantic coercion and serialization differ by major version.

## Verification and delivery

Use the repository runner and environment, targeted pytest checks and configured static analysis. Run migration tooling through its existing configuration; do not add create_all to production startup as a substitute for migrations. Profile only the relevant endpoint before introducing caches or concurrency. Report which dependencies were overridden, which real services were exercised, and whether lifespan ran.

References: [async tests](https://fastapi.tiangolo.com/advanced/async-tests/), [lifespan tests](https://fastapi.tiangolo.com/advanced/testing-events/), [yield dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/), [async execution](https://fastapi.tiangolo.com/async/), [response models](https://fastapi.tiangolo.com/tutorial/response-model/).
