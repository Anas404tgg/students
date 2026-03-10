// src/lib/auth/__tests__/token.test.ts
import { describe, expect, it } from "vitest";

import { generateResetToken, hashToken } from "../token";

describe("generateResetToken", () => {
  it("returns token, hashedToken, and expiresAt", () => {
    const result = generateResetToken();
    expect(result.token).toBeTruthy();
    expect(result.hashedToken).toBeTruthy();
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it("hashed token differs from raw token", () => {
    const { token, hashedToken } = generateResetToken();
    expect(token).not.toBe(hashedToken);
  });

  it("expiry is approximately 1 hour from now", () => {
    const before = Date.now();
    const { expiresAt } = generateResetToken();
    const after = Date.now();
    const oneHourMs = 60 * 60 * 1000;
    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + oneHourMs - 100);
    expect(expiresAt.getTime()).toBeLessThanOrEqual(after + oneHourMs + 100);
  });

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => generateResetToken().token));
    expect(tokens.size).toBe(50);
  });
});

describe("hashToken", () => {
  it("produces a hex string", () => {
    const hash = hashToken("test-token");
    expect(hash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex
  });

  it("produces consistent hashes", () => {
    const h1 = hashToken("same");
    const h2 = hashToken("same");
    expect(h1).toBe(h2);
  });

  it("matches generateResetToken output", () => {
    const { token, hashedToken } = generateResetToken();
    expect(hashToken(token)).toBe(hashedToken);
  });
});
