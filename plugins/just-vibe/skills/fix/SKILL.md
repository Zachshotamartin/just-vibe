---
name: fix
description: "Reproduce a bug, identify its cause, and verify the fix. Use when the requested outcome is correcting a demonstrated defect; debug diagnoses without default edits; security-fix repairs a confirmed vulnerability and checks alternate bypass routes."
---

# fix

Reproduce a bug, identify its cause, and verify the fix.

## Choose this workflow

Use when the requested outcome is correcting a demonstrated defect; debug diagnoses without default edits; security-fix repairs a confirmed vulnerability and checks alternate bypass routes.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **apply**. Apply; symptom, expected behavior, and reproduction context. Requires source and a reproducible case or reliable failure evidence.

**Pack prerequisites:** Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Correct the demonstrated cause and nearby necessary behavior; no broad cleanup.

Apply: only the requested local changes and relevant isolated verification. Inspect/plan requests remain inspection/planning. External actions require their exact action and target in session authorization.

## Execute

1. Read the behavior contract, nearby callers and existing checks before inferring expected behavior from the defective implementation. Separate the reproduced trigger, intended result and compatibility requirements; record conflicting evidence instead of choosing whichever makes the patch easiest.
2. Trace the failing input through validation, state transitions and the observable result. Choose a focused change that corrects the cause and preserves neighboring valid behavior; distinguish missing, null, zero, false and empty values where the contract does.
3. Reproduce the original failure, apply the fix and run relevant checks with actual exit statuses. Where a regression test is warranted, derive its expected result independently from the contract and establish that it detects the defect rather than incidental setup failure.
4. For a multi-phase feature, fix, refactor or MVP, use the relevant phase contract in the composed-workflows guide. Keep simple work direct. Delegate only when authorized, and use the reviewed worker result and acceptance flow before dependent work. Offer the plan-review canvas only when browser feedback is useful or requested.

## Technical method

- **Inspect:** Establish actual versus expected behavior, reproducible trigger and first causal divergence.
- **Method:** Create a discriminating regression, repair the owning boundary and check adjacent legitimate behavior.
- **Avoid misdiagnosis:** Editing the last visible exception or weakening the assertion can hide the root defect.
- **Check the result:** Demonstrate the original failure in isolation where feasible and verify the fix without relying on unrelated worktree changes.

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

- **When the written contract disagrees with the current fallback or coercion:** Treat the discrepancy as part of the bug investigation. Check callers and compatibility evidence; do not encode the old fallback into a new test merely because it already exists.
- **When failure cannot be reproduced:** Compare environments and choose a discriminating experiment. Label an unverified patch as partial and state which observation would establish the result.

## Deliver and verify

- Trigger, contract evidence, causal location, focused patch, actual before/after checks and remaining uncertainty.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- The original failure no longer occurs; a neighboring valid case stays correct.

## Stop and recover

- If reproduction is unavailable, label hypotheses and investigate without presenting a speculative patch as a verified fix.

## Example requests

- **Normal (apply):** An expired discount crashes checkout. Reproduce and preserve the error format.
- **Edge (apply):** Fix a null-input crash without changing the behavior of a zero-value input.
- **Blocked (inspect):** Diagnose an intermittent crash with no reproduction; do not claim a verified repair.
