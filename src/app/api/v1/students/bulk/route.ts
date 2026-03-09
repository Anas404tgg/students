// src/app/api/v1/students/bulk/route.ts
// POST /api/v1/students/bulk — Bulk actions (delete)

import type { NextRequest } from "next/server";
import { z } from "zod";

import { errorResponse, successResponse, validateBody } from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { studentService } from "@/services/student.service";
import type { SessionUser } from "@/types";

const bulkDeleteSchema = z.object({
  action: z.literal("delete"),
  ids: z.array(z.string().min(1)).min(1).max(100),
});

async function handlePost(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const body = await validateBody(request, bulkDeleteSchema);
    const count = await studentService.bulkDelete(
      body.ids,
      context.user.id,
      context.user.name ?? context.user.email
    );
    return successResponse({ deleted: count });
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(
  withAuth(handlePost),
  { max: 10, windowMs: 60_000 } // Very strict limit for bulk ops
);
