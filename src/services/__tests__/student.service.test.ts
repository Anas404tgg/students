// src/services/__tests__/student.service.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock } from "@/test/mocks/prisma";

import { studentService } from "../student.service";

// Mock audit-log so fire-and-forget calls don't fail
vi.mock("../audit-log.service", () => ({
  auditLogService: { create: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const mockStudent = {
  id: "s1",
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  dateOfBirth: null,
  gender: null,
  phone: null,
  address: null,
  city: null,
  state: null,
  zipCode: null,
  country: null,
  enrollmentDate: new Date("2024-01-15"),
  graduationDate: null,
  program: "CS",
  year: 2,
  gpa: 3.5,
  status: "ACTIVE",
  notes: null,
  avatar: null,
  isDeleted: false,
  deletedAt: null,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("studentService.getById", () => {
  it("returns the student if found", async () => {
    prismaMock.student.findFirst.mockResolvedValue(mockStudent);
    const result = await studentService.getById("s1");
    expect(result).toEqual(mockStudent);
    expect(prismaMock.student.findFirst).toHaveBeenCalledWith({
      where: { id: "s1", isDeleted: false },
    });
  });

  it("throws NotFoundError if not found", async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);
    await expect(studentService.getById("nope")).rejects.toThrow("not found");
  });
});

describe("studentService.create", () => {
  it("creates a student successfully", async () => {
    prismaMock.student.findFirst.mockResolvedValue(null); // no duplicate
    prismaMock.student.create.mockResolvedValue(mockStudent);

    const input = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      status: "ACTIVE" as const,
    };

    const result = await studentService.create(input, "u1", "Admin");
    expect(result).toEqual(mockStudent);
    expect(prismaMock.student.create).toHaveBeenCalledOnce();
  });

  it("throws ConflictError on duplicate email", async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: "existing" });

    const input = {
      firstName: "Jane",
      lastName: "Doe",
      email: "john@example.com",
      status: "ACTIVE" as const,
    };

    await expect(studentService.create(input)).rejects.toThrow("already exists");
  });
});

describe("studentService.update", () => {
  it("updates a student with matching version", async () => {
    prismaMock.student.findFirst.mockResolvedValue(mockStudent);
    prismaMock.student.update.mockResolvedValue({
      ...mockStudent,
      firstName: "Jane",
      version: 2,
    });

    const result = await studentService.update("s1", {
      firstName: "Jane",
      version: 1,
    });
    expect(result.firstName).toBe("Jane");
  });

  it("throws ConflictError on version mismatch", async () => {
    prismaMock.student.findFirst.mockResolvedValue(mockStudent);

    await expect(
      studentService.update("s1", { firstName: "Jane", version: 99 })
    ).rejects.toThrow("modified by another user");
  });

  it("throws NotFoundError if student doesn't exist", async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);

    await expect(
      studentService.update("nope", { firstName: "No", version: 1 })
    ).rejects.toThrow("not found");
  });
});

describe("studentService.softDelete", () => {
  it("soft-deletes successfully", async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: "s1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
    prismaMock.student.update.mockResolvedValue({
      ...mockStudent,
      isDeleted: true,
    });

    const result = await studentService.softDelete("s1");
    expect(result.isDeleted).toBe(true);
  });

  it("throws NotFoundError for missing student", async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);
    await expect(studentService.softDelete("nope")).rejects.toThrow("not found");
  });
});

describe("studentService.restore", () => {
  it("restores a soft-deleted student", async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: "s1" });
    prismaMock.student.update.mockResolvedValue({
      ...mockStudent,
      isDeleted: false,
      deletedAt: null,
    });

    const result = await studentService.restore("s1");
    expect(result.isDeleted).toBe(false);
  });
});

describe("studentService.bulkDelete", () => {
  it("returns the count of deleted records", async () => {
    prismaMock.student.updateMany.mockResolvedValue({ count: 3 });

    const result = await studentService.bulkDelete(["a", "b", "c"]);
    expect(result).toBe(3);
  });
});

describe("studentService.list", () => {
  it("returns paginated results", async () => {
    prismaMock.student.findMany.mockResolvedValue([mockStudent]);
    prismaMock.student.count.mockResolvedValue(1);

    const result = await studentService.list({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
  });

  it("applies search filter", async () => {
    prismaMock.student.findMany.mockResolvedValue([]);
    prismaMock.student.count.mockResolvedValue(0);

    await studentService.list({ search: "john" });

    const whereArg = prismaMock.student.findMany.mock.calls[0]![0]!.where;
    expect(whereArg.OR).toBeDefined();
    expect(whereArg.OR).toHaveLength(4);
  });

  it("clamps limit to 100", async () => {
    prismaMock.student.findMany.mockResolvedValue([]);
    prismaMock.student.count.mockResolvedValue(0);

    await studentService.list({ limit: 500 });

    const takeArg = prismaMock.student.findMany.mock.calls[0]![0]!.take;
    expect(takeArg).toBe(100);
  });
});
