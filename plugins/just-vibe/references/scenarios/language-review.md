# Language and runtime review methods

Read only the branch matching the changed code. Inspect the installed compiler/runtime, project conventions and actual boundary before applying a pattern. Language choice alone does not require a broad audit. Every finding needs a trigger and observable bad outcome.

## JavaScript and TypeScript

Types do not validate JSON, environment strings or external responses at runtime. Inspect `unknown` boundaries, unsafe casts, absent/null/zero distinctions and numeric precision for IDs or money. Trace promise ownership and rejection/cancellation rather than demanding `await` everywhere. Detached work can be intentional if lifetime and error handling are owned. For object maps use own properties or `Map`; untrusted object spreading can cross a privilege boundary.

Example: `const limit = Number(input) || 10` turns valid zero into ten and may hide invalid input. Define empty/zero/invalid semantics and test each independently. For async state, resolve request B before A and verify identity checks, not just cancellation, protect the current result. See [React methods](../packs/react.md) and [injection](../security/injection.md).

## Python

Inspect mutable defaults and class/module state, iterator exhaustion, timezone-aware comparisons, resource context managers and exception ownership. Trace blocking calls inside async tasks, cancellation cleanup and whether child work must stop with its parent. Use the installed version's structured concurrency semantics; swallowing cancellation can break timeout/task-group behavior. [Python task documentation](https://docs.python.org/3/library/asyncio-task.html).

Example: call `def collect(item, values=[])` twice with independent requests and inspect shared state. A corrected `None` default creates a new list while preserving an explicitly supplied empty list. Test resource cleanup on normal completion, dependency failure and cancellation. Do not unpickle untrusted test/model artifacts to inspect them.

## Go

Review goroutine lifetime, channel ownership/closure, context cancellation, error wrapping and synchronization of shared maps/state. State the interleaving that violates the invariant. An unbuffered send after the consumer has returned can leak a goroutine unless cancellation/lifetime is handled. Closing a channel is an ownership decision; multiple senders must not race to close it.

Use targeted `go test -race` when the installed toolchain/platform supports it and execution is in scope. A clean race-detector run covers only exercised schedules. Use bounded coordination tests to force competing accesses and verify cleanup after cancellation. [Go race detector](https://go.dev/doc/articles/race_detector).

## Java and JVM services

Inspect equality semantics, nullability, numeric precision, collection mutation and resource closure. Follow thread/executor ownership and visibility of shared state; an atomic field does not make a compound check-then-act transaction atomic. Inspect actual transaction proxy/call paths and connection ownership in framework services.

For money use the project's deliberate decimal/integer representation, test rounding at the business boundary and avoid constructing decimal values through unintended binary floating-point conversion. Coordinate two workers at the disputed read and assert the domain invariant, rather than inferring safety from annotations. Consult the installed JDK/framework documentation; older tutorials may not describe current virtual-thread or structured-concurrency behavior. [Java concurrency background](https://docs.oracle.com/javase/tutorial/essential/concurrency/).

## Rust and native code

For safe Rust, inspect panic/error contracts, blocking work in async contexts and ownership around cancellation. At `unsafe`, FFI or manual `Send`/`Sync` boundaries, write the required aliasing, lifetime, initialization and thread-safety invariants explicitly. A compiling unsafe block does not establish them. [Rust unsafe-code reference](https://doc.rust-lang.org/nomicon/).

For C/C++, follow allocation size, integer conversions, buffer bounds, object lifetime, ownership transfer and ABI assumptions. Prefer existing RAII/checked abstractions. Use the repository's supported sanitizer/toolchain setup in isolated tests where relevant; a sanitizer pass covers exercised behavior, not all undefined behavior. Test zero, maximum valid and just-invalid bounds without huge allocations, and exercise cleanup after partial construction.

## SQL and data code

Establish output grain, null semantics, grouping, timezone and engine/version. Two one-to-many joins can multiply aggregates even though every individual join is valid. A `LEFT JOIN` filtered on the right side in `WHERE` may intentionally or accidentally become an inner join. Compare a hand-computed fixture with two children per parent, missing children and null values. Use [database methods](../packs/database.md); do not execute EXPLAIN ANALYZE on a live target just to inspect a saved query.
