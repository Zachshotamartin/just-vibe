# Ktor, coroutines and small JVM service frameworks

Use when: ktor, kotlin coroutines, tinystruct.

Implement one request/service behavior with structured concurrency and bounded resource ownership.

## Inspect first

- Framework/plugin order and serialization config
- Coroutine scope, dispatcher and cancellation propagation
- Test engine versus actual network/database adapters

## Method

1. Keep child work inside the request/application scope that owns it. Re-throw cancellation; avoid detached GlobalScope work for request effects.
2. Install authentication and validation at the correct route boundary; test middleware order instead of relying on happy-path serialization.
3. Move blocking calls to an appropriate bounded dispatcher and propagate deadlines through dependencies.
4. For tinystruct or other less common frameworks, inspect the exact project dependency/source and existing extension points; do not transplant Ktor APIs.

## Failure cases

- A catch-all handler swallows CancellationException.
- A blocking database call stalls all event-loop requests.
- Test-only serialization differs from production configuration.

## Verification

- Use a virtual-time coroutine fixture and a cancellation test.
- Exercise malformed payload, unauthorized request and dependency timeout.
- Confirm no child job remains after request cancellation.

## Worked scenario

Cancel a slow request and assert its child repository operation is cancelled without becoming a 200 response.

## Version-sensitive primary references

- [ktor.io](https://ktor.io/docs/server-testing.html) — Read the official source for the installed version before relying on a version-sensitive API.
- [kotlinlang.org](https://kotlinlang.org/docs/cancellation-and-timeouts.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
