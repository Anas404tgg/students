// src/services/user.service.ts
// User business logic — registration, profile, password management

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateResetToken, hashToken } from "@/lib/auth/token";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { UserPublic, SessionUser } from "@/types";

// Fields to select for public user responses (no password / tokens)
const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  emailVerified: true,
  lastLoginAt: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─── Registration ────────────────────────────────────────────

async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<UserPublic> {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError("A user with this email already exists");
  }

  const hashedPw = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPw,
      role: "USER",
    },
    select: publicUserSelect,
  });

  logger.info("User registered", { userId: user.id, email: user.email });
  return user as UserPublic;
}

// ─── Profile ─────────────────────────────────────────────────

async function getProfile(userId: string): Promise<UserPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  return user as UserPublic;
}

async function updateProfile(
  userId: string,
  data: { name?: string; avatar?: string | null }
): Promise<UserPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: publicUserSelect,
  });

  logger.info("Profile updated", { userId });
  return updated as UserPublic;
}

// ─── Change Password ─────────────────────────────────────────

async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  const hashedPw = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPw },
  });

  logger.info("Password changed", { userId });
}

// ─── Password Reset ──────────────────────────────────────────

async function requestPasswordReset(
  email: string
): Promise<{ token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });

  // Return null silently if user not found (prevent enumeration)
  if (!user || !user.isActive) {
    return null;
  }

  const { token, hashedToken, expiresAt } = generateResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExp: expiresAt,
    },
  });

  logger.info("Password reset requested", { userId: user.id });
  return { token };
}

async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExp: { gt: new Date() },
      isActive: true,
    },
    select: { id: true },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  const hashedPw = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPw,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  logger.info("Password reset completed", { userId: user.id });
}

// ─── Admin: List Users ───────────────────────────────────────

async function listUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}): Promise<{ users: UserPublic[]; total: number }> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { email: { contains: params.search } },
    ];
  }
  if (params.role) {
    where.role = params.role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users: users as UserPublic[], total };
}

// ─── Admin: Toggle Active ────────────────────────────────────

async function toggleUserActive(
  userId: string,
  adminUser: SessionUser
): Promise<UserPublic> {
  if (userId === adminUser.id) {
    throw new ConflictError("Cannot deactivate your own account");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  });

  if (!user) {
    throw new NotFoundError("User", userId);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: publicUserSelect,
  });

  logger.info("User active status toggled", {
    userId,
    isActive: updated.isActive,
    by: adminUser.id,
  });

  return updated as UserPublic;
}

export const userService = {
  register,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  listUsers,
  toggleUserActive,
};
