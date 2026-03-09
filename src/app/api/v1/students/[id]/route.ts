// src/app/api/v1/students/[id]/route.ts
// GET    /api/v1/students/:id — Get student by ID
// PUT    /api/v1/students/:id — Update student
// DELETE /api/v1/students/:id — Soft-delete student

import type { NextRequest } from "next/server";

import { errorResponse, successResponse, validateBody } from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { studentUpdateSchema } from "@/lib/validators";
import { studentService } from "@/services/student.service";
import type { SessionUser } from "@/types";

// ─── GET /api/v1/students/:id ────────────────────────────────

async function handleGet(
  _request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const student = await studentService.getById(context.params.id!);
    return successResponse(student);
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = withRateLimit(withAuth(handleGet));

// ─── PUT /api/v1/students/:id ────────────────────────────────

async function handlePut(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const body = await validateBody(request, studentUpdateSchema);
    const student = await studentService.update(
      context.params.id!,
      body,
      context.user.id,
      context.user.name ?? context.user.email
    );
    return successResponse(student);
  } catch (error) {
    return errorResponse(error);
  }
}

export const PUT = withRateLimit(
  withAuth(handlePut),
  { max: 30, windowMs: 60_000 }
);

// ─── DELETE /api/v1/students/:id ─────────────────────────────

async function handleDelete(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const hard = request.nextUrl.searchParams.get("hard") === "true";

    if (hard) {
      // Hard delete requires ADMIN role
      if (context.user.role !== "ADMIN") {
        return errorResponse(
          { statusCode: 403, code: "FORBIDDEN", message: "Only admins can permanently delete students" }
        );
      }
      await studentService.hardDelete(
        context.params.id!,
        context.user.id,
        context.user.name ?? context.user.email
      );
      return successResponse({ deleted: true }, 200);
    }

    // Soft delete
    const student = await studentService.softDelete(
      context.params.id!,
      context.user.id,
      context.user.name ?? context.user.email
    );
    return successResponse(student);
  } catch (error) {
    return errorResponse(error);
  }
}

export const DELETE = withRateLimit(
  withAuth(handleDelete),
  { max: 20, windowMs: 60_000 }
);
