// src/services/__tests__/audit-log.service.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prismaMock } from "@/test/mocks/prisma";

import { auditLogService } from "../audit-log.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auditLogService.create", () => {
  it("creates an audit log entry", async () => {
    prismaMock.auditLog.create.mockResolvedValue({ id: "log1" });

    await auditLogService.create({
      action: "CREATE",
      entity: "Student",
      entityId: "s1",
      userId: "u1",
      userName: "Admin",
      changes: { name: "test" },
    });

    expect(prismaMock.auditLog.create).toHaveBeenCalledOnce();
    const data = prismaMock.auditLog.create.mock.calls[0]![0]!.data;
    expect(data.action).toBe("CREATE");
    expect(data.entity).toBe("Student");
    expect(data.changes).toBe(JSON.stringify({ name: "test" }));
  });

  it("does not throw on DB error (fire-and-forget)", async () => {
    prismaMock.auditLog.create.mockRejectedValue(new Error("DB down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      auditLogService.create({ action: "CREATE", entity: "Test" })
    ).resolves.toBeUndefined();

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("handles null optionals correctly", async () => {
    prismaMock.auditLog.create.mockResolvedValue({ id: "log2" });

    await auditLogService.create({
      action: "DELETE",
      entity: "Student",
    });

    const data = prismaMock.auditLog.create.mock.calls[0]![0]!.data;
    expect(data.entityId).toBeNull();
    expect(data.userId).toBeNull();
    expect(data.changes).toBeNull();
  });
});

describe("auditLogService.list", () => {
  it("returns paginated results", async () => {
    const mockLog = {
      id: "log1",
      action: "CREATE",
      entity: "Student",
      entityId: "s1",
      userId: "u1",
      userName: "Admin",
      changes: '{"test":true}',
      ipAddress: null,
      metadata: null,
      createdAt: new Date(),
    };

    prismaMock.auditLog.findMany.mockResolvedValue([mockLog]);
    prismaMock.auditLog.count.mockResolvedValue(1);

    const result = await auditLogService.list({ page: 1, limit: 10 });
    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.changes).toEqual({ test: true }); // parsed from JSON
    expect(result.meta.total).toBe(1);
  });

  it("applies filters", async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    await auditLogService.list({ action: "DELETE", entity: "Student" });

    const whereArg = prismaMock.auditLog.findMany.mock.calls[0]![0]!.where;
    expect(whereArg.action).toBe("DELETE");
    expect(whereArg.entity).toBe("Student");
  });

  it("clamps limit to 100", async () => {
    prismaMock.auditLog.findMany.mockResolvedValue([]);
    prismaMock.auditLog.count.mockResolvedValue(0);

    await auditLogService.list({ limit: 500 });

    const takeArg = prismaMock.auditLog.findMany.mock.calls[0]![0]!.take;
    expect(takeArg).toBe(100);
  });
});
