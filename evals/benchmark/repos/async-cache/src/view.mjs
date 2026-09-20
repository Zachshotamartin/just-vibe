export function createView(cache, publish) {
  return {
    async select(tenant, key) {
      try { publish({ value: await cache.get(tenant, key), error: null }); }
      catch (error) { publish({ value: null, error: error.message }); }
    },
    dispose() {},
  };
}
