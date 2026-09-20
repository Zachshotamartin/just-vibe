# React methods

Identify React/framework versions, server/client boundaries, data-fetching conventions and component state owners. Follow data from the source of truth through props, context, hooks and derived state. Preserve the existing state/fetch library unless changing it is requested.

Effects synchronize external systems. Check identity, dependency, cleanup and remount behavior; do not suppress dependency warnings to disguise stale closures. Reproduce out-of-order requests deterministically, and ensure stale responses cannot overwrite a newer account/query. Cancellation does not undo server-side effects.

Render performance requires profiler/interaction evidence. Find changing props/context and expensive work before introducing memoization, then compare the same interaction. State refactoring must preserve independent instances, resets, persistence and user-visible transitions.

Components/forms include valid, loading, invalid, failed, disabled and success behavior where applicable. Preserve input on recoverable errors; connect labels, errors and focus. Hydration work compares server and first client output, including time, randomness, locale, browser-only data and invalid nesting; suppressing the warning is not a fix.
