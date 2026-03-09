// src/types/index.ts
// Single source of truth for shared TypeScript types

import type { Student, User, AuditLog } from "@prisma/client";

// ─── Re-exports from Prisma ─────────────────────────────────
export type { Student, User, AuditLog };

// ─── Student types ───────────────────────────────────────────

/** Student without sensitive/internal fields, used for API responses. */
export type StudentPublic = Omit<Student, "isDeleted" | "deletedAt" | "version">;

/** Minimal student data for lists and tables. */
export type StudentSummary = Pick<
  Student,
  "id" | "firstName" | "lastName" | "email" | "status" | "program" | "gpa" | "enrollmentDate"
>;

// ─── User types ──────────────────────────────────────────────

/** User without password hash, used for API responses and sessions. */
export type UserPublic = Omit<User, "password" | "resetToken" | "resetTokenExp">;

/** Session user data available in NextAuth. */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
}

// ─── Pagination ──────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// ─── Audit Log ───────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userName: string | null;
  changes: Record<string, unknown> | null;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
}

// ─── Dashboard Analytics ─────────────────────────────────────

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  newThisMonth: number;
  averageGpa: number | null;
  statusDistribution: Record<string, number>;
  enrollmentTrend: { month: string; count: number }[];
  programDistribution: { program: string; count: number }[];
}

// ─── API Response Wrapper ────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]> | string;
    correlationId?: string;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

// ─── Feature Flags ───────────────────────────────────────────

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
}

// ─── CSV Import ──────────────────────────────────────────────

export interface CsvImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
}

// ─── Notification ────────────────────────────────────────────

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}
