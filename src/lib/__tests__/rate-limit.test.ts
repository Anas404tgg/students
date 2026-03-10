// src/lib/__tests__/rate-limit.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit, rateLimitHeaders } from "../rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request", () => {
    const result = checkRateLimit("test-ip-1", { max: 5, windowMs: 10_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("counts down remaining requests", () => {
    const key = "test-ip-2";
    const config = { max: 3, windowMs: 10_000 };

    checkRateLimit(key, config);
    const r2 = checkRateLimit(key, config);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(key, config);
    expect(r3.remaining).toBe(0);
    expect(r3.allowed).toBe(true);
  });

  it("blocks requests after limit exceeded", () => {
    const key = "test-ip-3";
    const config = { max: 2, windowMs: 10_000 };

    checkRateLimit(key, config);
    checkRateLimit(key, config);
    const r3 = checkRateLimit(key, config);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = "test-ip-4";
    const config = { max: 1, windowMs: 5_000 };

    checkRateLimit(key, config);
    const blocked = checkRateLimit(key, config);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(5_001);

    const fresh = checkRateLimit(key, config);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(0);
  });

  it("uses default config values", () => {
    const result = checkRateLimit("test-ip-5");
    expect(result.limit).toBe(100);
    expect(result.remaining).toBe(99);
  });
});

describe("rateLimitHeaders", () => {
  it("returns correct headers", () => {
    const headers = rateLimitHeaders({
      allowed: true,
      remaining: 42,
      resetAt: 1700000000000,
      limit: 100,
    });
    expect(headers["X-RateLimit-Limit"]).toBe("100");
    expect(headers["X-RateLimit-Remaining"]).toBe("42");
    expect(headers["X-RateLimit-Reset"]).toBe("1700000000");
  });

  it("clamps remaining to 0", () => {
    const headers = rateLimitHeaders({
      allowed: false,
      remaining: -5,
      resetAt: Date.now(),
      limit: 10,
    });
    expect(headers["X-RateLimit-Remaining"]).toBe("0");
  });
});
