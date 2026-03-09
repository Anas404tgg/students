// src/app/api/v1/auth/register/route.ts
// POST /api/v1/auth/register — Create a new user account

import type { NextRequest } from "next/server";

import { validateBody, successResponse, errorResponse } from "@/lib/api-utils";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import { registerSchema } from "@/lib/validators";
import { userService } from "@/services/user.service";

async function handlePost(request: NextRequest) {
  try {
    const body = await validateBody(request, registerSchema);
    const user = await userService.register({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    return successResponse(user, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(handlePost, {
  max: 5,
  windowMs: 60_000, // 5 registrations per minute per IP
});
