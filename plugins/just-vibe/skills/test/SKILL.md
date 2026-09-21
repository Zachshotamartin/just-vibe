---
name: test
description: "Add meaningful coverage for specified behavior Use to implement behavior checks; coverage identifies gaps and verify runs existing checks."
---

# test

Add meaningful coverage for specified behavior

## Choose this workflow

Use to implement behavior checks; coverage identifies gaps and verify runs existing checks.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; behavior to protect, target code, and existing test conventions.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Meaningful behavior coverage at the cheapest reliable layer; no arbitrary coverage quota or whole-suite rewrite.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Inspect existing tests, identify important gaps, choose unit/integration/end-to-end scope, add representative cases, and run relevant checks.
2. Choose the lowest layer that can observe the contract; retain an independent expected result and demonstrate that the check detects a plausible regression.
## Technical method

- **Inspect:** Identify the behavior at risk, existing test layer and independently known expected result.
- **Method:** Choose the lowest layer that observes the invariant, load its testing method and include a meaningful failure case.
- **Avoid misdiagnosis:** Mock call assertions or tests mirroring helper logic can pass while behavior is wrong.
- **Check the result:** Verify a plausible bad implementation fails for the intended reason and that the legitimate path passes.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- The affected project uses Django / DRF: [Django / DRF](../../references/frameworks/django.md).
- The affected project uses FastAPI: [FastAPI](../../references/frameworks/fastapi.md).
- The affected project uses Spring Boot: [Spring Boot](../../references/frameworks/spring-boot.md).
- The affected project uses Flutter: [Flutter](../../references/frameworks/flutter.md).
- The affected project uses React Native / Expo: [React Native / Expo](../../references/frameworks/react-native.md).
- The task specifically involves celery, python packaging, task redelivery; load only the matching method: [Python packaging and Celery delivery semantics](../../references/methods/python-celery.md).
- The task specifically involves jpa, hibernate, exposed, quarkus; load only the matching method: [JPA, Exposed and JVM transaction boundaries](../../references/methods/jvm-persistence.md).
- The task specifically involves ktor, kotlin coroutines, tinystruct; load only the matching method: [Ktor, coroutines and small JVM service frameworks](../../references/methods/kotlin-services.md).
- The task specifically involves laravel, rails, eloquent, active record; load only the matching method: [Laravel and Rails persistence, policies and jobs](../../references/methods/laravel-rails.md).
- The task specifically involves android compose, compose multiplatform, android architecture; load only the matching method: [Android and Compose Multiplatform lifecycle](../../references/methods/android-compose.md).
- The task specifically involves swiftui, swift 6, actor persistence, foundation models, liquid glass; load only the matching method: [SwiftUI, actors and Swift concurrency](../../references/methods/swift-concurrency.md).
- The task specifically involves harmonyos, arkts, arkui; load only the matching method: [HarmonyOS and ArkTS state/lifecycle](../../references/methods/harmonyos-arkts.md).
- The task specifically involves angular, vue, nuxt, ui to vue; load only the matching method: [Angular, Vue and Nuxt reactive boundaries](../../references/methods/angular-vue.md).
- The task specifically involves next.js, turbopack, nestjs, bun runtime; load only the matching method: [Next.js, NestJS and Bun runtime behavior](../../references/methods/next-nest-bun.md).
- The task specifically involves ef core, asp.net, c#, f#, dotnet; load only the matching method: [C#, EF Core and F# contracts](../../references/methods/dotnet-fsharp.md).
- The task specifically involves go race, rust lifetime, cpp sanitizer, c++, systems review; load only the matching method: [Go, Rust and C++ ownership and concurrency](../../references/methods/systems-languages.md).
- The task specifically involves perl, cpan, taint mode; load only the matching method: [Perl input handling and test isolation](../../references/methods/perl-security.md).
- The task specifically involves postgresql, mysql, database execution plan; load only the matching method: [PostgreSQL and MySQL query/migration behavior](../../references/methods/postgres-mysql.md).
- The task specifically involves clickhouse, redis, prisma; load only the matching method: [ClickHouse, Redis and Prisma semantics](../../references/methods/clickhouse-redis-prisma.md).

## Decision branches

- **When the proposed assertion mirrors internal implementation:** Replace it with an external invariant or consumer-observable result.

## Deliver and verify

- Tests, fixture changes when necessary, execution results, and covered behavior.
- Tests and fixtures mapped to requirements, execution results and uncovered boundaries.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- A realistic behavioral regression fails the new test; harmless internal refactoring does not invalidate assertions.

## Stop and recover

- Report unavailable services/runners. Avoid tests that merely restate implementation or require live paid endpoints without authorization.

## Example requests

- **Normal (apply):** Add meaningful coverage for expired invitations and repeated acceptance.
- **edge (apply):** Add tests for duplicate submissions and a legitimate repeated purchase.
- **blocked (inspect):** Assess test design without the integration environment; do not mark mocks as live coverage.
