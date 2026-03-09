// src/lib/auth/token.ts
// Secure token generation for password resets and email verification

import crypto from "crypto";

/**
 * Generate a cryptographically secure random token.
 * Returns both the raw token (sent to user) and the hashed version (stored in DB).
 */
export function generateResetToken(): {
  token: string;
  hashedToken: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Token valid for 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  return { token, hashedToken, expiresAt };
}

/**
 * Hash a token for safe storage / comparison.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
