// src/services/student.service.ts
// Student business logic — all DB operations go through this service

import type { Prisma, Student } from "@prisma/client";

import { ConflictError, NotFoundError } from "@/lib/errors";
import prisma from "@/lib/prisma";
import type { StudentCreateInput, StudentUpdateInput } from "@/lib/validators";

import { auditLogService } from "./audit-log.service";

// Fields projected for list views — avoids returning large text fields
const STUDENT_LIST_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  dateOfBirth: true,
  gender: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  enrollmentDate: true,
  graduationDate: true,
  program: true,
  year: true,
  gpa: true,
  status: true,
  notes: true,
  avatar: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface StudentListParams {
  search?: string;
  status?: string;
  program?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  cursor?: string;
}

export const studentService = {
  /**
   * List students with filtering, search, sorting, and pagination.
   * Supports both offset and cursor-based pagination.
   */
  async list(params: StudentListParams) {
    const {
      search,
      status,
      program,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
      cursor,
    } = params;

    const safeLimit = Math.min(Math.max(limit, 1), 100);

    // Build where clause — only show non-deleted students
    const where: Prisma.StudentWhereInput = { isDeleted: false };

    if (status) {
      where.status = status;
    }

    if (program) {
      where.program = { contains: program };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { program: { contains: search } },
      ];
    }

    // Cursor-based pagination
    if (cursor) {
      const [data, total] = await Promise.all([
        prisma.student.findMany({
          where,
          take: safeLimit + 1, // Fetch one extra to check hasMore
          cursor: { id: cursor },
          skip: 1, // Skip the cursor itself
          orderBy: { [sort]: order },
          select: STUDENT_LIST_SELECT,
        }),
        prisma.student.count({ where }),
      ]);

      const hasMore = data.length > safeLimit;
      const results = hasMore ? data.slice(0, safeLimit) : data;
      const nextCursor = hasMore ? results[results.length - 1]?.id : undefined;

      return {
        data: results,
        meta: {
          total,
          page: 0, // Not applicable for cursor pagination
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
          hasMore,
          nextCursor,
        },
      };
    }

    // Offset-based pagination
    const skip = (page - 1) * safeLimit;

    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { [sort]: order },
        select: STUDENT_LIST_SELECT,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasMore: skip + safeLimit < total,
      },
    };
  },

  /**
   * Get a single student by ID.
   */
  async getById(id: string): Promise<Student> {
    const student = await prisma.student.findFirst({
      where: { id, isDeleted: false },
    });

    if (!student) {
      throw new NotFoundError("Student", id);
    }

    return student;
  },

  /**
   * Create a new student with duplicate email check.
   */
  async create(
    input: StudentCreateInput,
    userId?: string,
    userName?: string
  ): Promise<Student> {
    // Check for duplicate email
    const existing = await prisma.student.findFirst({
      where: { email: input.email, isDeleted: false },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictError(`A student with email '${input.email}' already exists`);
    }

    const student = await prisma.student.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        dateOfBirth: input.dateOfBirth ?? null,
        gender: input.gender ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        zipCode: input.zipCode ?? null,
        country: input.country ?? null,
        enrollmentDate: input.enrollmentDate ?? new Date(),
        graduationDate: input.graduationDate ?? null,
        program: input.program ?? null,
        year: input.year ?? null,
        gpa: input.gpa ?? null,
        status: input.status ?? "ACTIVE",
        notes: input.notes ?? null,
      },
    });

    // Fire-and-forget audit log
    void auditLogService.create({
      action: "CREATE",
      entity: "Student",
      entityId: student.id,
      userId,
      userName,
      changes: { created: input },
    });

    return student;
  },

  /**
   * Update a student with optimistic concurrency control.
   */
  async update(
    id: string,
    input: StudentUpdateInput,
    userId?: string,
    userName?: string
  ): Promise<Student> {
    const existing = await prisma.student.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundError("Student", id);
    }

    // Optimistic concurrency — reject if version doesn't match
    if (input.version !== undefined && input.version !== existing.version) {
      throw new ConflictError(
        "This record has been modified by another user. Please refresh and try again."
      );
    }

    // Check email uniqueness if changed
    if (input.email && input.email !== existing.email) {
      const emailTaken = await prisma.student.findFirst({
        where: { email: input.email, isDeleted: false, id: { not: id } },
        select: { id: true },
      });
      if (emailTaken) {
        throw new ConflictError(
          `A student with email '${input.email}' already exists`
        );
      }
    }

    // Build changes diff for audit log
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const { version: _version, ...updateFields } = input;
    for (const [key, value] of Object.entries(updateFields)) {
      if (value !== undefined) {
        const existingValue = existing[key as keyof typeof existing];
        if (String(existingValue) !== String(value)) {
          changes[key] = { from: existingValue, to: value };
        }
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...updateFields,
        version: { increment: 1 },
      },
    });

    void auditLogService.create({
      action: "UPDATE",
      entity: "Student",
      entityId: id,
      userId,
      userName,
      changes,
    });

    return student;
  },

  /**
   * Soft-delete a student.
   */
  async softDelete(
    id: string,
    userId?: string,
    userName?: string
  ): Promise<Student> {
    const existing = await prisma.student.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!existing) {
      throw new NotFoundError("Student", id);
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        version: { increment: 1 },
      },
    });

    void auditLogService.create({
      action: "DELETE",
      entity: "Student",
      entityId: id,
      userId,
      userName,
      changes: {
        softDeleted: {
          name: `${existing.firstName} ${existing.lastName}`,
          email: existing.email,
        },
      },
    });

    return student;
  },

  /**
   * Restore a soft-deleted student.
   */
  async restore(
    id: string,
    userId?: string,
    userName?: string
  ): Promise<Student> {
    const existing = await prisma.student.findFirst({
      where: { id, isDeleted: true },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundError("Student", id);
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        version: { increment: 1 },
      },
    });

    void auditLogService.create({
      action: "RESTORE",
      entity: "Student",
      entityId: id,
      userId,
      userName,
    });

    return student;
  },

  /**
   * Hard-delete a student (admin only).
   */
  async hardDelete(
    id: string,
    userId?: string,
    userName?: string
  ): Promise<void> {
    const existing = await prisma.student.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!existing) {
      throw new NotFoundError("Student", id);
    }

    // Must delete audit logs referencing this student first
    await prisma.auditLog.deleteMany({ where: { entityId: id } });
    await prisma.student.delete({ where: { id } });

    void auditLogService.create({
      action: "HARD_DELETE",
      entity: "Student",
      entityId: null, // Entity no longer exists
      userId,
      userName,
      changes: {
        permanentlyDeleted: {
          name: `${existing.firstName} ${existing.lastName}`,
          email: existing.email,
        },
      },
    });
  },

  /**
   * Bulk soft-delete multiple students.
   */
  async bulkDelete(
    ids: string[],
    userId?: string,
    userName?: string
  ): Promise<number> {
    const result = await prisma.student.updateMany({
      where: { id: { in: ids }, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    void auditLogService.create({
      action: "DELETE",
      entity: "Student",
      entityId: null,
      userId,
      userName,
      changes: { bulkDeleted: { ids, count: result.count } },
    });

    return result.count;
  },

  /**
   * Get dashboard statistics.
   */
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalStudents,
      activeStudents,
      graduatedStudents,
      newThisMonth,
      avgGpa,
      statusCounts,
      programCounts,
    ] = await Promise.all([
      prisma.student.count({ where: { isDeleted: false } }),
      prisma.student.count({ where: { isDeleted: false, status: "ACTIVE" } }),
      prisma.student.count({ where: { isDeleted: false, status: "GRADUATED" } }),
      prisma.student.count({
        where: { isDeleted: false, createdAt: { gte: startOfMonth } },
      }),
      prisma.student.aggregate({
        where: { isDeleted: false, gpa: { not: null } },
        _avg: { gpa: true },
      }),
      prisma.student.groupBy({
        by: ["status"],
        where: { isDeleted: false },
        _count: { status: true },
      }),
      prisma.student.groupBy({
        by: ["program"],
        where: { isDeleted: false, program: { not: null } },
        _count: { program: true },
        orderBy: { _count: { program: "desc" } },
        take: 10,
      }),
    ]);

    // Build enrollment trend (last 12 months)
    const enrollmentTrend: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await prisma.student.count({
        where: {
          isDeleted: false,
          enrollmentDate: { gte: monthStart, lt: monthEnd },
        },
      });
      enrollmentTrend.push({
        month: monthStart.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        count,
      });
    }

    const statusDistribution: Record<string, number> = {};
    for (const row of statusCounts) {
      statusDistribution[row.status] = row._count.status;
    }

    const programDistribution = programCounts.map((row) => ({
      program: row.program ?? "Undeclared",
      count: row._count.program,
    }));

    return {
      totalStudents,
      activeStudents,
      graduatedStudents,
      newThisMonth,
      averageGpa: avgGpa._avg.gpa
        ? Math.round(avgGpa._avg.gpa * 100) / 100
        : null,
      statusDistribution,
      enrollmentTrend,
      programDistribution,
    };
  },
};
