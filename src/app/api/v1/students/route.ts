// src/app/api/v1/students/route.ts
// GET /api/v1/students — List students (paginated, searchable, sortable)
// POST /api/v1/students — Create a new student

import type { NextRequest } from "next/server";

import {
  errorResponse,
  successResponse,
  validateBody,
  validateQuery,
} from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { studentCreateSchema, studentQuerySchema } from "@/lib/validators";
import { studentService } from "@/services/student.service";
import type { SessionUser } from "@/types";

// ─── GET /api/v1/students ────────────────────────────────────

async function handleGet(
  request: NextRequest,
  _context: { params: Record<string, string>; user: SessionUser }
) {
  const query = validateQuery(request, studentQuerySchema);
  const result = await studentService.list(query);
  return successResponse(result.data, 200, result.meta);
}

export const GET = withRateLimit(withAuth(handleGet));

// ─── POST /api/v1/students ───────────────────────────────────

async function handlePost(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const body = await validateBody(request, studentCreateSchema);
    const student = await studentService.create(
      { ...body, status: body.status ?? "ACTIVE" },
      context.user.id,
      context.user.name ?? context.user.email
    );
    return successResponse(student, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(
  withAuth(handlePost),
  { max: 30, windowMs: 60_000 } // Stricter limit for writes
);
