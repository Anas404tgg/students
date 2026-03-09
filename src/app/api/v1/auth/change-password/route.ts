// src/app/api/v1/auth/change-password/route.ts
// POST /api/v1/auth/change-password — Change password (authenticated)

import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { validateBody, successResponse, errorResponse } from "@/lib/api-utils";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { userService } from "@/services/user.service";
import type { SessionUser } from "@/types";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

async function handlePost(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
): Promise<NextResponse> {
  try {
    const body = await validateBody(request, changePasswordSchema);
    await userService.changePassword(
      context.user.id,
      body.currentPassword,
      body.newPassword
    );
    return successResponse({ message: "Password changed successfully" });
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(withAuth(handlePost), {
  max: 5,
  windowMs: 60_000,
});
