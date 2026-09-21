---
name: debug
description: "Investigate and explain a failure before changing code Use to identify a cause and next experiment; fix applies a requested repair."
---

# debug

Investigate and explain a failure before changing code

## Choose this workflow

Use to identify a cause and next experiment; fix applies a requested repair.

Read [shared execution](../../references/execution.md) for context/mode/authority handling and [General methods](../../references/packs/general.md) for tool selection and operational details. Resolve these paths from this skill file; all runtime assets ship inside the plugin.

## Input and mode

Use the complete request appended to this invocation, preserving all constraints and references. Default mode: **inspect**. Inspect; failure evidence, environment, and expected behavior. Running a reproduction that writes requires apply mode or explicit execution authorization.

Resolve the user brief and inspect the relevant project or supplied evidence. External capabilities are optional unless the selected action actually needs them.

- **Infer from evidence:** Resolve the named files, existing scripts, current task and earlier corrections from the conversation and repository.
- **Reasonable default:** Use the narrowest interpretation that completes a reversible local task; state a consequential assumption once.
- **Ask only when needed:** Ask when competing targets or incompatible success conditions would change the result; continue independent inspection first.

Declared evidence requirements: `project.read`. Use actual host discovery or adequate supplied artifacts; unavailable evidence remains blocked/unknown.

## Scope

Diagnosis and narrowing; no automatic code repair.

No product edits during diagnosis. Requested reproduction may create synthetic fixtures in owned temporary locations; tracked fixture-writing checks use an explicitly scoped apply verification. A request to repair selects the fix workflow.

## Execute

1. Build a hypothesis list, inspect logs and code, seek evidence that distinguishes causes, and identify the smallest next experiment.
2. Rank hypotheses by discriminating observations, trace the first divergence from expected behavior, and use bounded probes rather than repeated full runs.
## Technical method

- **Inspect:** Collect logs, inputs, revision/environment and a bounded reproduction.
- **Method:** Rank hypotheses by evidence and run the smallest experiment that distinguishes them before changing code.
- **Avoid misdiagnosis:** Correlation with a recent edit or a noisy downstream stack trace does not establish causality.
- **Check the result:** Explain the causal chain and the observation that rejected competing hypotheses; unresolved causes remain unresolved.

## Read when relevant

- When a concrete decision or deliverable example would clarify this workflow: [General worked example](../../references/examples/general.md).
- Language/runtime semantics, concurrency or resource ownership can change the result: [Language and runtime review methods](../../references/scenarios/language-review.md).
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

- **When logs establish symptoms but not causation:** Report competing hypotheses and the lowest-cost observation that separates them.

## Deliver and verify

- Most supported cause, supporting/contradicting evidence, and a proposed fix or reproduction step.
- Hypothesis table with supporting/contradicting evidence and the next targeted probe.

Verify these observable conditions when applicable to the actual task; do not claim they were exercised from merely reading this file:

- Eliminates an initially plausible false cause; insufficient evidence yields ranked hypotheses, not false certainty.

## Stop and recover

- Avoid repeated identical probes. Do not mutate production or install debugging tools implicitly.

## Example requests

- **Normal (inspect):** Investigate intermittent checkout failures from these logs; do not change files.
- **edge (inspect):** Diagnose a timeout that occurs only after a successful database write.
- **blocked (inspect):** Diagnose using redacted logs only; do not restart services or infer missing spans.
