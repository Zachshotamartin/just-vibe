---
name: refactor
description: "Improve structure while preserving behavior Use for structural change with preserved behavior; migrate changes a version or public compatibility boundary."
---

# refactor

Improve structure while preserving behavior

## Choose this workflow

Use for structural change with preserved behavior; migrate changes a version or public compatibility boundary.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; structural goal, target modules, and behavior/API constraints. Requires source and a baseline verification method.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Internal organization with preserved observable behavior; feature changes are separate.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Capture relevant behavior, identify seams, transform incrementally, preserve call contracts, and compare results against the baseline.
2. Identify public exports, serialization and error contracts; transform one seam at a time and compare behavior against existing consumer checks.
3. For a multi-phase feature, fix, refactor or MVP, use the relevant phase contract in the composed-workflows guide. Keep simple work direct. Delegate only when authorized, and use the reviewed worker result and acceptance flow before dependent work. Offer the plan-review canvas only when browser feedback is useful or requested.
## Technical method

- **Inspect:** Identify public contracts, state ownership, side effects and behavior-sensitive tests.
- **Method:** Change structure in coherent steps while preserving observable semantics, including error and timing contracts.
- **Avoid misdiagnosis:** Renaming a pure helper differs from moving async ownership or transaction boundaries; both cannot use the same evidence bar.
- **Check the result:** Compare representative success/failure behavior before and after and inspect callers for changed ordering or identity semantics.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).
- Coordinating feature, fix, refactor or MVP phases; use exact worker and canvas operations only when needed: [Composed workflows and reviewed coordination](../../references/composed-workflows.md).
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

- **When code appears unused but is registered dynamically:** Trace registration and configuration before deleting or moving it.

## Deliver and verify

- Focused structural changes, rationale, compatibility evidence, and remaining debt.
- Structural rationale, compatibility surface and checks showing preserved behavior.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Existing consumers continue to work; boundary/error behavior survives the reorganization.

## Stop and recover

- If behavior is undocumented, characterize it before changing it. Do not fold a semantic fix into the refactor without naming the scope change.

## Example requests

- **Normal (apply):** Separate validation from persistence without changing the public API.
- **edge (apply):** Extract a service without changing exception types or serialized output.
- **blocked (inspect):** Assess a refactor when integration tests cannot run; identify unverified contracts.
