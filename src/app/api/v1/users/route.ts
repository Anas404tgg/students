// src/app/api/v1/users/route.ts
// GET /api/v1/users — List users (admin only)

import type { NextRequest, NextResponse } from "next/server";

import { successResponse, errorResponse } from "@/lib/api-utils";
import { withRole } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { userService } from "@/services/user.service";
import type { SessionUser } from "@/types";

async function handleGet(
  request: NextRequest,
  _context: { params: Record<string, string>; user: SessionUser }
): Promise<NextResponse> {
  try {
    const url = request.nextUrl;
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 10, 100);
    const search = url.searchParams.get("search") ?? undefined;
    const role = url.searchParams.get("role") ?? undefined;

    const { users, total } = await userService.listUsers({
      page,
      limit,
      search,
      role,
    });

    return successResponse(users, 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = withRateLimit(withRole("ADMIN", handleGet));
