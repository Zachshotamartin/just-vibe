export function createCache(fetchValue, { ttl = 100, now = Date.now } = {}) {
  const cache = new Map();
  return {
    async get(tenant, key, { signal } = {}) {
      const prior = cache.get(key);
      if (prior && now() < prior.expires) return prior.value;
      const value = await fetchValue(tenant, key, { signal });
      cache.set(key, { value, expires: now() + ttl });
      return value;
    },
    invalidate(tenant, key) { cache.delete(key); },
  };
}
