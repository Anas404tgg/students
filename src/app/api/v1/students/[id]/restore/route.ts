// src/app/api/v1/students/[id]/restore/route.ts
// POST /api/v1/students/:id/restore — Restore a soft-deleted student

import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { studentService } from "@/services/student.service";
import type { SessionUser } from "@/types";

async function handlePost(
  _request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const student = await studentService.restore(
      context.params.id!,
      context.user.id,
      context.user.name ?? context.user.email
    );
    return successResponse(student);
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(withAuth(handlePost));
