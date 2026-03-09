// src/app/api/v1/students/export/route.ts
// GET /api/v1/students/export — Export students as CSV

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import prisma from "@/lib/prisma";
import { auditLogService } from "@/services/audit-log.service";
import type { SessionUser } from "@/types";

async function handleGet(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const status = request.nextUrl.searchParams.get("status") ?? undefined;

    const where: Record<string, unknown> = { isDeleted: false };
    if (status) where.status = status;

    const students = await prisma.student.findMany({
      where,
      orderBy: { lastName: "asc" },
      select: {
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
        program: true,
        year: true,
        gpa: true,
        status: true,
      },
    });

    // Build CSV
    const headers = [
      "firstName",
      "lastName",
      "email",
      "dateOfBirth",
      "gender",
      "phone",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
      "enrollmentDate",
      "program",
      "year",
      "gpa",
      "status",
    ];

    const csvRows = [headers.join(",")];

    for (const student of students) {
      const row = headers.map((h) => {
        const val = student[h as keyof typeof student];
        if (val === null || val === undefined) return "";
        if (val instanceof Date) return val.toISOString().split("T")[0];
        const str = String(val);
        // Escape CSV values containing commas, quotes, or newlines
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(row.join(","));
    }

    const csv = csvRows.join("\n");

    // Audit log
    void auditLogService.create({
      action: "EXPORT",
      entity: "Student",
      userId: context.user.id,
      userName: context.user.name ?? context.user.email,
      metadata: { count: students.length, format: "csv", status },
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="students_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = withRateLimit(
  withAuth(handleGet),
  { max: 10, windowMs: 60_000 }
);
