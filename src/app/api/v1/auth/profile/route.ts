// src/app/api/v1/auth/profile/route.ts
// GET  /api/v1/auth/profile — Get current user profile
// PUT  /api/v1/auth/profile — Update profile (name, avatar)

import type { NextRequest, NextResponse } from "next/server";

import { validateBody, successResponse, errorResponse } from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { profileUpdateSchema } from "@/lib/validators";
import { userService } from "@/services/user.service";
import type { SessionUser } from "@/types";

// ─── GET /api/v1/auth/profile ────────────────────────────────

async function handleGet(
  _request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
): Promise<NextResponse> {
  try {
    const profile = await userService.getProfile(context.user.id);
    return successResponse(profile);
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = withRateLimit(withAuth(handleGet));

// ─── PUT /api/v1/auth/profile ────────────────────────────────

async function handlePut(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
): Promise<NextResponse> {
  try {
    const body = await validateBody(request, profileUpdateSchema);
    const profile = await userService.updateProfile(context.user.id, body);
    return successResponse(profile);
  } catch (error) {
    return errorResponse(error);
  }
}

export const PUT = withRateLimit(withAuth(handlePut));
