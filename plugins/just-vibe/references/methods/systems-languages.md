# Go, Rust and C++ ownership and concurrency

Use when: go race, rust lifetime, cpp sanitizer, c++, systems review.

Debug or review a bounded systems-language behavior using the declared toolchain and build flags.

## Inspect first

- Compiler/toolchain, feature flags and build system
- Memory/resource owner, lifetimes and thread/task boundaries
- Unsafe/FFI code and cancellation/error paths

## Method

1. Construct the smallest failing input and follow ownership through allocation, transfer, cleanup and error unwinding.
2. In Go, check goroutine termination, channel ownership and race-prone shared state; run the race detector on exercised paths.
3. In Rust, inspect unsafe invariants, Send/Sync assumptions, interior mutability and async cancellation; avoid using unsafe merely to silence borrow errors.
4. In C++, check lifetime invalidation, iterator/reference stability, integer bounds and RAII cleanup; use the relevant address/undefined/thread sanitizer separately where required.

## Failure cases

- A cancellation path leaks a goroutine or resource.
- A pointer remains after container reallocation.
- An FFI caller violates alignment, lifetime or ownership promised by an unsafe wrapper.

## Verification

- Run minimal compile/test cases on declared feature sets.
- Add a negative input that exercises the actual ownership bug.
- Report sanitizer/race coverage limits rather than claiming absence of all races.

## Worked scenario

Grow a vector after taking a reference in the failing C++ fixture; the repaired code must not retain an invalidated reference.

## Version-sensitive primary references

- [go.dev](https://go.dev/doc/articles/race_detector) — Read the official source for the installed version before relying on a version-sensitive API.
- [doc.rust-lang.org](https://doc.rust-lang.org/nomicon/) — Read the official source for the installed version before relying on a version-sensitive API.
- [clang.llvm.org](https://clang.llvm.org/docs/AddressSanitizer.html) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
