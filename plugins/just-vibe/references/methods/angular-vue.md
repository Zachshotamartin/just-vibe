# Angular, Vue and Nuxt reactive boundaries

Use when: angular, vue, nuxt, ui to vue.

Implement component/SSR behavior using the framework’s actual reactivity and rendering model.

## Inspect first

- Framework/SSR version, routing and hydration
- Signal/ref/computed ownership and subscription cleanup
- Dependency injection scope, runtime config and server secrets

## Method

1. Convert a visual design into semantic components with explicit inputs/events rather than copying a screenshot into one monolithic component.
2. Keep derived values computed; avoid effects/watchers that write back to their own dependencies without a termination rule.
3. For SSR/Nuxt, distinguish server-private and client-public runtime values, per-request state and shared module singletons.
4. In Angular, test provider lifetime and async teardown; in Vue, preserve reactive references when destructuring and clean up watchers/listeners owned by components.

## Failure cases

- A module singleton leaks one SSR user’s data into another request.
- Destructuring loses the intended reactive connection.
- A route transition leaves subscriptions active.

## Verification

- Render two isolated SSR requests with different users.
- Test rapid prop/route changes and unmount during async work.
- Inspect hydration, semantic controls and focus in a browser.

## Worked scenario

Two simultaneous profile requests must never share a module-level user object in the server renderer.

## Version-sensitive primary references

- [vuejs.org](https://vuejs.org/guide/scaling-up/ssr.html) — Read the official source for the installed version before relying on a version-sensitive API.
- [angular.dev](https://angular.dev/guide/di) — Read the official source for the installed version before relying on a version-sensitive API.

This is a host-agent method, not an installed vendor service. Inspect versions and available tools, preserve the requested scope, and report unavailable live checks. Do not treat a checklist as proof of correctness or compliance.
