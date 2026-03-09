// src/lib/errors.ts
// Typed error responses for consistent API error handling

import type { HTTP_STATUS } from "./constants";

type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]> | string;
    correlationId?: string;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    nextCursor?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: string;
  public readonly details?: Record<string, string[]> | string;

  constructor(
    message: string,
    statusCode: HttpStatusCode,
    code: string,
    details?: Record<string, string[]> | string
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(
      id ? `${entity} with ID '${id}' not found` : `${entity} not found`,
      404,
      "NOT_FOUND"
    );
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super("Validation failed", 422, "VALIDATION_ERROR", details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super("Too many requests. Please try again later.", 429, "RATE_LIMITED");
  }
}

/**
 * Format an error into a consistent API error response.
 */
export function formatErrorResponse(
  error: unknown,
  correlationId?: string
): { status: number; body: ApiErrorResponse } {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          correlationId,
        },
      },
    };
  }

  // Unknown errors — don't leak internal details
  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        correlationId,
      },
    },
  };
}
