export type RateLimitOptions = {
  maxPerMinute: number;
};

type Bucket = {
  windowStartedAtMs: number;
  count: number;
};

export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string, nowMs = Date.now()): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
      const windowMs = 60_000;
      const current = buckets.get(key);
      if (!current || nowMs - current.windowStartedAtMs >= windowMs) {
        buckets.set(key, { windowStartedAtMs: nowMs, count: 1 });
        return { allowed: true };
      }

      if (current.count >= options.maxPerMinute) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (nowMs - current.windowStartedAtMs)) / 1000)),
        };
      }

      current.count += 1;
      return { allowed: true };
    },
  };
}
