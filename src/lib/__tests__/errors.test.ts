// src/lib/__tests__/errors.test.ts
import { describe, expect, it } from "vitest";

import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
  formatErrorResponse,
} from "../errors";

describe("AppError", () => {
  it("creates an error with status code and code", () => {
    const err = new AppError("Something failed", 400, "BAD_REQUEST");
    expect(err.message).toBe("Something failed");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.name).toBe("AppError");
    expect(err).toBeInstanceOf(Error);
  });

  it("supports optional details", () => {
    const details = { email: ["Invalid email"] };
    const err = new AppError("Validation", 422, "VALIDATION", details);
    expect(err.details).toEqual(details);
  });
});

describe("NotFoundError", () => {
  it("creates a 404 error with entity name", () => {
    const err = new NotFoundError("Student");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Student not found");
  });

  it("includes ID in message when provided", () => {
    const err = new NotFoundError("Student", "abc-123");
    expect(err.message).toBe("Student with ID 'abc-123' not found");
  });
});

describe("ValidationError", () => {
  it("creates a 422 error with field details", () => {
    const details = { email: ["Required"], name: ["Too short"] };
    const err = new ValidationError(details);
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(details);
  });
});

describe("UnauthorizedError", () => {
  it("creates a 401 error with default message", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Authentication required");
  });

  it("accepts custom message", () => {
    const err = new UnauthorizedError("Token expired");
    expect(err.message).toBe("Token expired");
  });
});

describe("ForbiddenError", () => {
  it("creates a 403 error", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });
});

describe("ConflictError", () => {
  it("creates a 409 error", () => {
    const err = new ConflictError("Email already in use");
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe("Email already in use");
  });
});

describe("RateLimitError", () => {
  it("creates a 429 error", () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
  });
});

describe("formatErrorResponse", () => {
  it("formats AppError correctly", () => {
    const err = new NotFoundError("Student", "123");
    const { status, body } = formatErrorResponse(err, "corr-id");
    expect(status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toContain("123");
    expect(body.error.correlationId).toBe("corr-id");
  });

  it("formats unknown errors as 500", () => {
    const { status, body } = formatErrorResponse(new Error("oops"));
    expect(status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("formats non-Error values as 500", () => {
    const { status } = formatErrorResponse("string error");
    expect(status).toBe(500);
  });
});
