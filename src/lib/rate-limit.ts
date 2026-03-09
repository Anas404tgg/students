// src/lib/rate-limit.ts
// In-memory rate limiter — swap with Redis for production at scale
// Uses a sliding window counter approach

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks
const CLEANUP_INTERVAL = 60_000; // 1 minute
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    const keys = Array.from(store.keys());
    for (const key of keys) {
      const entry = store.get(key);
      if (entry && now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  // Allow process to exit
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export interface RateLimitConfig {
  /** Max requests per window. Default: 100 */
  max?: number;
  /** Window duration in milliseconds. Default: 60000 (1 min) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

/**
 * Check rate limit for a given key (e.g., IP address).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const max = config.max ?? 100;
  const windowMs = config.windowMs ?? 60_000;
  const now = Date.now();

  startCleanup();

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs, limit: max };
  }

  entry.count++;

  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, limit: max };
  }

  return {
    allowed: true,
    remaining: max - entry.count,
    resetAt: entry.resetAt,
    limit: max,
  };
}

/**
 * Returns rate limit headers for the response.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
