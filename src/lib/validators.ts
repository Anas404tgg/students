// src/lib/validators.ts
// Zod validation schemas — single source of truth for input validation

import { z } from "zod";

import {
  MAX_ACADEMIC_YEAR,
  MAX_GPA,
  MIN_ACADEMIC_YEAR,
  MIN_GPA,
} from "./constants";

// ─── Student Schemas ─────────────────────────────────────────

export const studentCreateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or less")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be 255 characters or less")
    .toLowerCase()
    .trim(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z
    .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
    .optional()
    .nullable(),
  phone: z.string().max(20, "Phone must be 20 characters or less").optional().nullable(),
  address: z.string().max(500, "Address must be 500 characters or less").optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  zipCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  enrollmentDate: z.coerce.date().optional(),
  graduationDate: z.coerce.date().optional().nullable(),
  program: z.string().max(200).optional().nullable(),
  year: z
    .number()
    .int()
    .min(MIN_ACADEMIC_YEAR)
    .max(MAX_ACADEMIC_YEAR)
    .optional()
    .nullable(),
  gpa: z.number().min(MIN_GPA).max(MAX_GPA).optional().nullable(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"])
    .default("ACTIVE"),
  notes: z.string().max(2000, "Notes must be 2000 characters or less").optional().nullable(),
});

export const studentUpdateSchema = studentCreateSchema.partial().extend({
  version: z.number().int().positive("Version is required for optimistic concurrency"),
});

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;

// ─── Query Schemas ───────────────────────────────────────────

export const studentQuerySchema = z.object({
  search: z.string().max(200).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"]).optional(),
  program: z.string().max(200).optional(),
  sort: z
    .enum([
      "firstName",
      "lastName",
      "email",
      "enrollmentDate",
      "gpa",
      "createdAt",
      "updatedAt",
    ])
    .optional()
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  cursor: z.string().optional(),
});

export type StudentQueryInput = z.infer<typeof studentQuerySchema>;

// ─── Auth Schemas ────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be 100 characters or less")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or less")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── User Profile Schema ────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  avatar: z.string().url().optional().nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ─── CSV Import Schema ──────────────────────────────────────

export const csvStudentRowSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  phone: z.string().optional(),
  program: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"]).optional(),
});
