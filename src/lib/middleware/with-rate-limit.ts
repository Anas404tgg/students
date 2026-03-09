// src/lib/middleware/with-rate-limit.ts
// Rate limiting middleware for API routes

import { type NextRequest, NextResponse } from "next/server";

import { getClientIp } from "@/lib/api-utils";
import {
  checkRateLimit,
  type RateLimitConfig,
  rateLimitHeaders,
} from "@/lib/rate-limit";

/**
 * Wraps an API handler with rate limiting.
 * Returns 429 if limit exceeded, otherwise passes through.
 */
export function withRateLimit(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const key = getClientIp(request) ?? "anonymous";
    const result = checkRateLimit(`api:${key}`, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: rateLimitHeaders(result),
        }
      );
    }

    const response = await handler(request, context);

    // Attach rate limit headers to successful responses
    const headers = rateLimitHeaders(result);
    for (const [k, v] of Object.entries(headers)) {
      response.headers.set(k, v);
    }

    return response;
  };
}
