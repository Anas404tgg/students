// src/app/api/v1/auth/forgot-password/route.ts
// POST /api/v1/auth/forgot-password — Request a password reset link

import type { NextRequest } from "next/server";

import { validateBody, successResponse, errorResponse } from "@/lib/api-utils";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { forgotPasswordSchema } from "@/lib/validators";
import { userService } from "@/services/user.service";

async function handlePost(request: NextRequest) {
  try {
    const body = await validateBody(request, forgotPasswordSchema);
    const result = await userService.requestPasswordReset(body.email);

    if (result) {
      // In production, send this token via email.
      // For development, log it.
      logger.info("Password reset token generated", {
        email: body.email,
        resetUrl: `${process.env.APP_URL}/reset-password?token=${result.token}`,
      });
    }

    // Always return success to prevent email enumeration
    return successResponse({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(handlePost, {
  max: 3,
  windowMs: 60_000, // 3 requests per minute per IP
});
