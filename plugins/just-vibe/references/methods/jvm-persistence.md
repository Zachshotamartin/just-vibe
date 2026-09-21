# JPA, Exposed and JVM transaction boundaries

Use when: jpa, hibernate, exposed orm, quarkus.

Review persistence and request lifecycle behavior on the declared JVM framework version.

## Inspect first

- Gradle/Maven wrapper, Java/Kotlin versions
- Transaction owner, isolation and entity lifecycle
- Generated SQL, fetch strategy and tenant filters

## Method

1. Trace one request through security filters, service transactions and SQL. Validate object/tenant authorization in addition to route authentication.
2. Inspect lazy loading, N+1 queries and pagination with joins using representative data. Avoid assuming a repository method is one query.
3. Keep blocking JDBC work off event-loop threads; propagate cancellation and avoid holding transactions across remote calls.
4. For Exposed/Quarkus/Spring variants, read the installed version’s transaction and test APIs before choosing fixtures.

## Failure cases

- Self-invocation bypasses a proxy-managed transaction.
- Lazy access outside a persistence context fails only after serialization.
- A suspended transaction outlives the request and retains a connection.

## Verification

- Assert rollback on the relevant exception type.
- Record SQL count/plan for a representative page.
- Run auth, tenant and cancellation failure cases with a real database fixture.

## Worked scenario

Fetching fifty parents must not trigger fifty hidden child queries when serializing the response.

## Version-sensitive primary references

- [hibernate.org](https://hibernate.org/orm/documentation/) — Read the official source for the installed version before relying on a version-sensitive API.
- [www.jetbrains.com](https://www.jetbrains.com/help/exposed/transactions.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
