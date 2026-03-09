// src/lib/constants.ts
// Application-wide constants

export const APP_NAME = process.env.APP_NAME || "Student Management System";
export const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Student status options
export const STUDENT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  GRADUATED: "GRADUATED",
  SUSPENDED: "SUSPENDED",
} as const;

export type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

// Gender options
export const GENDER_OPTIONS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
} as const;

export type Gender = (typeof GENDER_OPTIONS)[keyof typeof GENDER_OPTIONS];

// User roles
export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Audit log actions
export const AUDIT_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  RESTORE: "RESTORE",
  HARD_DELETE: "HARD_DELETE",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",
  LOGIN: "LOGIN",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// Sort directions
export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const;

// HTTP status codes (for consistent usage)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Rate limiting
export const RATE_LIMIT = {
  MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX) || 100,
  WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
} as const;

// CSV import/export
export const CSV_MAX_ROWS = 10_000;
export const CSV_BATCH_SIZE = 100;

// File upload
export const MAX_FILE_SIZE = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Academic year range
export const MIN_ACADEMIC_YEAR = 1;
export const MAX_ACADEMIC_YEAR = 6;

// GPA range
export const MIN_GPA = 0.0;
export const MAX_GPA = 4.0;
