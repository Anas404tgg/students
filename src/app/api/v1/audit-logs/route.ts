// src/app/api/v1/audit-logs/route.ts
// GET /api/v1/audit-logs — List audit logs (admin only)

import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api-utils";
import { withRole } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { auditLogService } from "@/services/audit-log.service";
import type { SessionUser } from "@/types";

async function handleGet(
  request: NextRequest,
  _context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const sp = request.nextUrl.searchParams;
    const result = await auditLogService.list({
      entity: sp.get("entity") ?? undefined,
      entityId: sp.get("entityId") ?? undefined,
      userId: sp.get("userId") ?? undefined,
      action: sp.get("action") ?? undefined,
      page: sp.get("page") ? Number(sp.get("page")) : undefined,
      limit: sp.get("limit") ? Number(sp.get("limit")) : undefined,
    });
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = withRateLimit(withRole("ADMIN", handleGet));
