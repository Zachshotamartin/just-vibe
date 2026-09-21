# C#, EF Core and F# contracts

Use when: ef core, asp.net, c#, f#, dotnet.

Implement a typed service/domain change with the project’s pinned SDK and serializer conventions.

## Inspect first

- global.json, target frameworks and nullable context
- DI lifetimes, DbContext owner and async cancellation
- F# unions/options and wire-format compatibility

## Method

1. Avoid capturing scoped services in singletons; create an explicit scope for background work and dispose it at the correct boundary.
2. Pass cancellation through async I/O and avoid blocking on Task.Result in request paths.
3. Inspect generated EF SQL for translation, tracking, pagination and concurrency behavior; use a database fixture when in-memory semantics differ.
4. For F#, model invalid states with discriminated unions and test serialization compatibility explicitly. Keep domain transformations pure and effects at boundaries.

## Failure cases

- A singleton retains a DbContext across concurrent requests.
- A LINQ expression runs locally or translates differently than expected.
- Changing a union case breaks existing serialized messages.

## Verification

- Use the declared SDK and relevant target-framework matrix.
- Test cancellation, optimistic-concurrency conflict and scope disposal.
- Property-test domain invariants and round-trip representative wire fixtures.

## Worked scenario

Two concurrent updates to a versioned row must produce a controlled conflict instead of silently overwriting one update.

## Version-sensitive primary references

- [learn.microsoft.com](https://learn.microsoft.com/en-us/ef/core/testing/) — Read the official source for the installed version before relying on a version-sensitive API.
- [learn.microsoft.com](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) — Read the official source for the installed version before relying on a version-sensitive API.
- [learn.microsoft.com](https://learn.microsoft.com/en-us/dotnet/fsharp/language-reference/discriminated-unions) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
