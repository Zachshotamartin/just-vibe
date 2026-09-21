# React state, async and render evidence

Use when: react testing, react race, hydration mismatch, react strictmode.

Diagnose one React behavior using the repository’s runtime and test environment.

## Inspect first

- React/compiler version and client/server boundary
- State ownership, keys and effect dependencies
- Existing user-interaction tests and profiler traces

## Method

1. Reproduce the state transition with user events and awaited accessible queries; avoid reaching into component internals.
2. Treat effects as synchronization with external systems. Derive render data directly unless expensive measurement justifies memoization.
3. Abort or ignore stale requests; scope request identity to the current entity. Test an older response resolving after a newer response.
4. For hydration, compare initial server/client inputs including locale, time and random values. Put browser-only work after hydration rather than suppressing all warnings.

## Failure cases

- StrictMode reveals missing cleanup through duplicate subscriptions.
- An index key transfers input state between reordered rows.
- A stale response overwrites the user’s newer selection.

## Verification

- Make the race fail without the fix by controlling promise resolution order.
- Use profiler evidence before claiming reduced renders.
- Verify keyboard, loading, empty and error states in a browser.

## Worked scenario

Select account B before account A’s request completes; A’s late response must not replace B’s data.

## Version-sensitive primary references

- [react.dev](https://react.dev/learn/synchronizing-with-effects) — Read the official source for the installed version before relying on a version-sensitive API.
- [testing-library.com](https://testing-library.com/docs/react-testing-library/intro/) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
