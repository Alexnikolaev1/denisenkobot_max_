function createMemorySession(options = {}) {
  const ttlMs = options.ttlMs ?? 1000 * 60 * 60 * 24;
  const cleanupEvery = options.cleanupEvery ?? 500;
  let requestsCounter = 0;

  const store = new Map();

  function cleanupExpiredSessions(now) {
    for (const [userId, value] of store.entries()) {
      if (now - value.updatedAt > ttlMs) {
        store.delete(userId);
      }
    }
  }

  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) {
      return next();
    }

    const now = Date.now();
    requestsCounter += 1;
    if (requestsCounter % cleanupEvery === 0) {
      cleanupExpiredSessions(now);
    }

    const current = store.get(userId);
    if (current) {
      current.updatedAt = now;
      ctx.session = current.data;
    } else {
      const fresh = {};
      store.set(userId, { data: fresh, updatedAt: now });
      ctx.session = fresh;
    }

    return next();
  };
}

module.exports = { createMemorySession };
