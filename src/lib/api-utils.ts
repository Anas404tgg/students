// src/lib/api-utils.ts
// Shared utilities for API route handlers

import { type NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

import { AppError, formatErrorResponse } from "./errors";
import { generateCorrelationId } from "./utils";

/**
 * Extracts the request body and validates it against a Zod schema.
 * Returns the parsed data or throws a structured validation error.
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AppError("Invalid JSON body", 400, "INVALID_JSON");
  }
  return schema.parse(body);
}

/**
 * Validates query parameters against a Zod schema.
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  return schema.parse(params);
}

/**
 * Standard success response.
 */
export function successResponse<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status }
  );
}

/**
 * Standard error response handler for API routes.
 * Catches AppError, ZodError, and unexpected errors.
 */
export function errorResponse(error: unknown, correlationId?: string) {
  const corrId = correlationId ?? generateCorrelationId();

  // Zod validation errors → 422
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".") || "body";
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details,
          correlationId: corrId,
        },
      },
      { status: 422 }
    );
  }

  // Known application errors
  const { status, body } = formatErrorResponse(error, corrId);
  return NextResponse.json(body, { status });
}

/**
 * Wraps an API handler with error handling and correlation ID.
 */
export function withErrorHandler(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string> }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const correlationId = generateCorrelationId();
    try {
      const response = await handler(request, context);
      response.headers.set("x-correlation-id", correlationId);
      return response;
    } catch (error) {
      console.error(`[${correlationId}] API Error:`, error);
      return errorResponse(error, correlationId);
    }
  };
}

/**
 * Extract client IP from request headers (proxy-aware).
 */
export function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}
