// src/app/api/v1/students/stats/route.ts
// GET /api/v1/students/stats — Dashboard statistics

import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { studentService } from "@/services/student.service";
import type { SessionUser } from "@/types";

async function handleGet(
  _request: NextRequest,
  _context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const stats = await studentService.getStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = withRateLimit(withAuth(handleGet));
