// src/services/audit-log.service.ts
// Audit log service — records all data mutations for compliance & debugging

import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

export interface CreateAuditLogInput {
  action: string;
  entity: string;
  entityId?: string | null;
  userId?: string | null;
  userName?: string | null;
  changes?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

export const auditLogService = {
  /**
   * Create an audit log entry. Fire-and-forget — never blocks the main operation.
   */
  async create(input: CreateAuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          userId: input.userId ?? null,
          userName: input.userName ?? null,
          changes: input.changes ? JSON.stringify(input.changes) : null,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
    } catch (error) {
      // Audit logs should never break the main flow
      console.error("Failed to create audit log:", error);
    }
  },

  /**
   * Query audit logs with pagination and filters.
   */
  async list(params: {
    entity?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;
    if (params.userId) where.userId = params.userId;
    if (params.action) where.action = params.action;

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          userId: true,
          userName: true,
          changes: true,
          ipAddress: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: data.map((log) => ({
        ...log,
        changes: log.changes ? JSON.parse(log.changes) : null,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  },
};
