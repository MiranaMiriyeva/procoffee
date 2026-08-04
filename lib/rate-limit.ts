// Simple in-memory sliding-window rate limiter.
// Good enough for a single-café Vercel deployment (one admin, low traffic).
// If you ever scale to multiple regions, swap for @upstash/ratelimit + Upstash Redis.

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
}

// Cleanup expired entries occasionally to prevent unbounded growth.
if (typeof globalThis.setInterval === "function") {
  const CLEANUP_INTERVAL_MS = 5 * 60_000;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, CLEANUP_INTERVAL_MS).unref?.();
}
