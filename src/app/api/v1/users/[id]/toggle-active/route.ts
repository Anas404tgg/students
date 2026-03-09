// src/app/api/v1/users/[id]/toggle-active/route.ts
// POST /api/v1/users/:id/toggle-active — Enable/disable user (admin only)

import type { NextRequest, NextResponse } from "next/server";

import { successResponse, errorResponse } from "@/lib/api-utils";
import { withRole } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { userService } from "@/services/user.service";
import type { SessionUser } from "@/types";

async function handlePost(
  _request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
): Promise<NextResponse> {
  try {
    const user = await userService.toggleUserActive(
      context.params.id!,
      context.user
    );
    return successResponse(user);
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(withRole("ADMIN", handlePost));
