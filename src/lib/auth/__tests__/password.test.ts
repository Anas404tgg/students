// src/lib/auth/__tests__/password.test.ts
import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../password";

describe("hashPassword", () => {
  it("returns a hash different from the original", async () => {
    const hash = await hashPassword("mypassword");
    expect(hash).not.toBe("mypassword");
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt prefix
  });

  it("produces different hashes for the same input", async () => {
    const hash1 = await hashPassword("same");
    const hash2 = await hashPassword("same");
    expect(hash1).not.toBe(hash2); // different salt each time
  });
});

describe("verifyPassword", () => {
  it("returns true for matching password", async () => {
    const hash = await hashPassword("correct");
    const result = await verifyPassword("correct", hash);
    expect(result).toBe(true);
  });

  it("returns false for wrong password", async () => {
    const hash = await hashPassword("correct");
    const result = await verifyPassword("wrong", hash);
    expect(result).toBe(false);
  });
});
