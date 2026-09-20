# Directory cache

A framework-independent data layer used by two account-picker views. `src/cache.mjs` supplies `createCache(fetchValue, {ttl, now})`. `src/view.mjs` publishes `{value,error}` after a selection. There are no dependencies. Run `npm test` or `node --test test/*.test.mjs`.

Contract:
- Keys are the ordered pair (tenant, key), each an arbitrary string. Equal pairs share one pending fetch; distinct pairs must never collide, including delimiter characters.
- `fetchValue(tenant,key,options)` may resolve synchronously, throw synchronously, or return a promise. A failed fetch is not cached; the next request may retry.
- A settled value, including undefined or null, is reused until `now() >= completionTime + ttl`. Zero TTL means no settled reuse, but concurrent pending requests still coalesce.
- Each `get` caller has independent optional AbortSignal cancellation. An already-aborted caller receives an AbortError and starts no fetch. Cancelling one waiter rejects that waiter promptly, while other waiters and the underlying shared work remain usable. Never pass one caller's signal into the shared fetch. Remove each abort listener after that waiter's promise settles.
- `invalidate(tenant,key)` detaches the existing pending/settled entry. Existing waiters can still settle; new callers start fresh work. The detached result must neither replace nor delete a newer entry, even if the old work rejects or resolves later.
- In the view, only the latest selection may publish either success or failure. Disposal permanently stops publication and future fetch requests. `select` must fulfill after handling a fetch failure or cancellation.
- Preserve the exported API. No dependencies, network calls, persistent cache or framework changes are requested.
