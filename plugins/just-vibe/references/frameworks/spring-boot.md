# Spring Boot services

Use for Java or Kotlin Spring Boot applications. Read the Boot/Spring/JDK versions, Maven or Gradle wrapper, active profiles, security configuration, persistence layer and test conventions. Match javax versus jakarta APIs to the project's generation. Never upgrade the platform just to fit an example.

## Implementation boundaries

Trace controller → validation → authentication/security filters → method authorization → service → persistence. Inspect SecurityFilterChain ordering and request matchers; an earlier permissive chain can bypass a later restriction. Verify method security is actually enabled and invoked. DTO validation does not authorize object ownership. Scope repository queries and writable associations by the caller's tenant or resource policy.

Place @Transactional on the service boundary that owns the invariant. In proxy mode, a call from one method to another method on the same instance does not pass through the transactional proxy. Check rollback rules for checked exceptions, propagation and readOnly semantics. Avoid broad exception catches that convert a failed transaction into apparent success. Do not assume @Async carries a transaction, security context or request-local state to another thread.

Use database constraints for uniqueness and state transitions. Test optimistic version conflicts or pessimistic locking against the intended engine. Avoid sending messages before commit; use after-commit handling or the project's durable outbox depending on delivery requirements. Bound retries and make the business effect idempotent.

Inspect lazy relations, serialization and open-session-in-view behavior before moving entity access outside a transaction. Use projection/fetch plans for list responses and measure the query count. Do not expose JPA entities as public API models merely to avoid mapping. Keep mutable request data out of singleton beans; align executor and connection-pool capacity with actual load.

## Test selection

- Pure domain tests cover logic without starting Spring. MVC slices cover routing/validation but do not prove the complete production filter chain or database semantics.
- For authorization changes, exercise the actual configured filter/method path with anonymous, permitted and cross-tenant identities. Include CSRF for browser credential flows instead of disabling it solely because the API calls itself stateless.
- Use a full integration test with the project's real database family for locking, migrations, SQL dialect and constraints. Testcontainers can supply an isolated database when Docker is available; a container that failed to start is a blocked check, not a passed test.
- Avoid tests that read uncommitted writes within the same rollback-only test transaction when the behavior depends on commit. Force flush/clear or use a separate transaction/request as appropriate.
- Test a self-invocation path if the fix relies on transaction/security proxies. Verify the actual effect rolls back, rather than asserting an annotation exists.
- Exercise duplicate requests and broker retries, migration compatibility, time-zone serialization and expected error mapping.

## Verification and delivery

Use ./mvnw or ./gradlew with the repository's configured test tasks and JDK. Keep production credentials out of test profiles. Inspect Actuator exposure, configuration precedence and deployment-specific overrides when relevant. Explain which slices versus full application/database tests ran, and any unavailable container or broker coverage.

References: [transaction annotations](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html), [Boot testing](https://docs.spring.io/spring-boot/reference/testing/index.html), [Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html), [method security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html). Use version-matched documentation.
