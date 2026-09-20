# React methods

Identify React/framework versions, server/client boundaries, data-fetching conventions and component state owners. Follow data from the source of truth through props, context, hooks and derived state. Preserve the existing state/fetch library unless changing it is requested.

Effects synchronize external systems. Check identity, dependency, cleanup and remount behavior; do not suppress dependency warnings to disguise stale closures. Reproduce out-of-order requests deterministically, and ensure stale responses cannot overwrite a newer account/query. Cancellation does not undo server-side effects.

Render performance requires profiler/interaction evidence. Find changing props/context and expensive work before introducing memoization, then compare the same interaction. State refactoring must preserve independent instances, resets, persistence and user-visible transitions.

Components/forms include valid, loading, invalid, failed, disabled and success behavior where applicable. Preserve input on recoverable errors; connect labels, errors and focus. Hydration work compares server and first client output, including time, randomness, locale, browser-only data and invalid nesting; suppressing the warning is not a fix.

## Applied methods

### Request-race fixture

For an account panel, control two deferred responses: select A, select B, resolve B, then resolve A. The final visible account must remain B. Separately unmount before completion. A cleanup abort may reduce work, but response identity or an equivalent library guarantee must prevent stale state updates. Do not assert that aborting a request reverses a server-side mutation.

Effects synchronize with external systems. Derived display values often belong in rendering. Check dependencies and cleanup across setup, changed inputs and unmount; development remount checks can reveal missing cleanup. Follow the installed React/framework semantics rather than suppressing warnings. [React useEffect](https://react.dev/reference/react/useEffect).

### State and form contracts

Name the source of truth for each value. A draft may intentionally differ from a prop; define when it resets instead of copying props into state on every update. Test two independent component instances to catch accidental shared state.

For forms, exercise editing, invalid input, pending submission, server rejection and retry. Preserve values after a recoverable rejection, associate field errors programmatically and return focus deliberately. UI pending state alone does not prevent duplicate server effects.

### Performance and hydration

Capture one slow interaction with fixed data. Inspect render and commit duration, changing prop/context identities and expensive work before memoization. Re-run the same interaction and check that callbacks/data remain current; lower render count alone is not a useful result.

For hydration, compare server markup and first client output before effects. Check locale, time, randomness, browser-only storage and invalid nesting. Resolve an inconsistent initial snapshot or define an intentional boundary; hiding warnings does not establish matching output or working controls.
