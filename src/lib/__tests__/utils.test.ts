// src/lib/__tests__/utils.test.ts
import { describe, expect, it, vi } from "vitest";

import {
  debounce,
  formatDate,
  generateCorrelationId,
  getInitials,
  safeJsonParse,
  sleep,
  truncate,
} from "../utils";

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-03-15"));
    expect(result).toContain("2024");
    expect(result).toContain("Mar");
    expect(result).toContain("15");
  });

  it("formats a date string", () => {
    const result = formatDate("2024-12-25");
    expect(result).toContain("2024");
    expect(result).toContain("Dec");
  });

  it("accepts custom options", () => {
    const result = formatDate("2024-01-01", { month: "long" });
    expect(result).toContain("January");
  });
});

describe("debounce", () => {
  it("delays execution", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("resets timer on subsequent calls", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced();
    vi.advanceTimersByTime(100);
    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it("passes arguments through", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a", "b");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("a", "b");

    vi.useRealTimers();
  });
});

describe("sleep", () => {
  it("resolves after the specified delay", async () => {
    vi.useFakeTimers();
    const promise = sleep(500);
    vi.advanceTimersByTime(500);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe("generateCorrelationId", () => {
  it("returns a string starting with req_", () => {
    const id = generateCorrelationId();
    expect(id).toMatch(/^req_\d+_[a-z0-9]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateCorrelationId()));
    expect(ids.size).toBe(100);
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
  });

  it("returns null for invalid JSON", () => {
    expect(safeJsonParse("not json")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(safeJsonParse("")).toBeNull();
  });
});

describe("truncate", () => {
  it("returns short strings unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    const result = truncate("hello world", 6);
    expect(result).toHaveLength(6);
    expect(result).toBe("hello…");
  });

  it("handles exact-length strings", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("getInitials", () => {
  it("extracts initials from two-word name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("handles single name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("limits to 2 characters for long names", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });

  it("uppercases initials", () => {
    expect(getInitials("john doe")).toBe("JD");
  });
});
