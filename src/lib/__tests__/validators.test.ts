// src/lib/__tests__/validators.test.ts
import { describe, expect, it } from "vitest";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  studentCreateSchema,
  studentQuerySchema,
  studentUpdateSchema,
} from "../validators";

describe("studentCreateSchema", () => {
  const validStudent = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  };

  it("accepts valid minimal input", () => {
    const result = studentCreateSchema.parse(validStudent);
    expect(result.firstName).toBe("John");
    expect(result.status).toBe("ACTIVE"); // default
  });

  it("accepts full input", () => {
    const result = studentCreateSchema.parse({
      ...validStudent,
      phone: "123-456-7890",
      gender: "MALE",
      program: "Computer Science",
      year: 3,
      gpa: 3.5,
      status: "ACTIVE",
      notes: "Good student",
    });
    expect(result.gpa).toBe(3.5);
    expect(result.year).toBe(3);
  });

  it("rejects missing firstName", () => {
    expect(() =>
      studentCreateSchema.parse({ lastName: "Doe", email: "a@b.com" })
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      studentCreateSchema.parse({ ...validStudent, email: "not-email" })
    ).toThrow();
  });

  it("rejects GPA out of range", () => {
    expect(() =>
      studentCreateSchema.parse({ ...validStudent, gpa: 5.0 })
    ).toThrow();
    expect(() =>
      studentCreateSchema.parse({ ...validStudent, gpa: -1 })
    ).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() =>
      studentCreateSchema.parse({ ...validStudent, status: "INVALID" })
    ).toThrow();
  });

  it("lowercases email", () => {
    const result = studentCreateSchema.parse({
      ...validStudent,
      email: "John@Example.COM",
    });
    expect(result.email).toBe("john@example.com");
  });
});

describe("studentUpdateSchema", () => {
  it("requires version field", () => {
    expect(() => studentUpdateSchema.parse({ firstName: "Jane" })).toThrow();
  });

  it("allows partial updates with version", () => {
    const result = studentUpdateSchema.parse({ firstName: "Jane", version: 1 });
    expect(result.firstName).toBe("Jane");
    expect(result.version).toBe(1);
  });
});

describe("studentQuerySchema", () => {
  it("sets defaults for empty input", () => {
    const result = studentQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.sort).toBe("createdAt");
    expect(result.order).toBe("desc");
  });

  it("coerces string numbers", () => {
    const result = studentQuerySchema.parse({ page: "3", limit: "25" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(25);
  });

  it("rejects invalid status", () => {
    expect(() => studentQuerySchema.parse({ status: "INVALID" })).toThrow();
  });

  it("rejects limit over 100", () => {
    expect(() => studentQuerySchema.parse({ limit: "101" })).toThrow();
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.parse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects missing email", () => {
    expect(() => loginSchema.parse({ password: "123456" })).toThrow();
  });

  it("rejects empty password", () => {
    expect(() =>
      loginSchema.parse({ email: "a@b.com", password: "" })
    ).toThrow();
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.parse({
      email: "new@example.com",
      password: "StrongPass1!",
      confirmPassword: "StrongPass1!",
      name: "New User",
    });
    expect(result.name).toBe("New User");
  });

  it("rejects short password", () => {
    expect(() =>
      registerSchema.parse({
        email: "a@b.com",
        password: "short",
        name: "Test",
      })
    ).toThrow();
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.parse({ email: "user@example.com" });
    expect(result.email).toBe("user@example.com");
  });

  it("rejects invalid email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "not-email" })).toThrow();
  });
});
