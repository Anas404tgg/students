// src/app/api/v1/auth/reset-password/route.ts
// POST /api/v1/auth/reset-password — Reset password with token

import type { NextRequest } from "next/server";

import { validateBody, successResponse, errorResponse } from "@/lib/api-utils";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { resetPasswordSchema } from "@/lib/validators";
import { userService } from "@/services/user.service";

async function handlePost(request: NextRequest) {
  try {
    const body = await validateBody(request, resetPasswordSchema);
    await userService.resetPassword(body.token, body.password);
    return successResponse({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(handlePost, {
  max: 5,
  windowMs: 60_000,
});
