// src/app/api/v1/students/import/route.ts
// POST /api/v1/students/import — Import students from CSV

import type { NextRequest } from "next/server";

import { errorResponse, successResponse } from "@/lib/api-utils";
import { AppError } from "@/lib/errors";
import { withAuth } from "@/lib/middleware/with-auth";
import { withRateLimit } from "@/lib/middleware/with-rate-limit";
import prisma from "@/lib/prisma";
import { csvStudentRowSchema } from "@/lib/validators";
import { auditLogService } from "@/services/audit-log.service";
import type { SessionUser } from "@/types";

const MAX_IMPORT_ROWS = 10_000;

/**
 * Simple CSV parser — handles quoted fields, commas inside quotes, escaped quotes.
 */
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headerLine = lines[0]!;
  const headers = parseCsvLine(headerLine);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]!] = values[j] ?? "";
    }
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }

  result.push(current.trim());
  return result;
}

async function handlePost(
  request: NextRequest,
  context: { params: Record<string, string>; user: SessionUser }
) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    let csvText: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        throw new AppError("No CSV file provided", 400, "MISSING_FILE");
      }
      if (!file.name.endsWith(".csv")) {
        throw new AppError("File must be a .csv file", 400, "INVALID_FILE_TYPE");
      }
      csvText = await file.text();
    } else {
      // Accept raw CSV text in body
      csvText = await request.text();
    }

    if (!csvText.trim()) {
      throw new AppError("CSV file is empty", 400, "EMPTY_FILE");
    }

    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      throw new AppError("No data rows found in CSV", 400, "NO_DATA");
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      throw new AppError(
        `CSV exceeds maximum of ${MAX_IMPORT_ROWS} rows`,
        400,
        "TOO_MANY_ROWS"
      );
    }

    // Validate and import rows
    let successCount = 0;
    const errors: { row: number; message: string }[] = [];

    // Process in batches for performance
    const BATCH_SIZE = 50;
    for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
      const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);
      const createData = [];

      for (let i = 0; i < batch.length; i++) {
        const rowIndex = batchStart + i + 2; // +2 for header row + 1-indexed
        const row = batch[i]!;

        const parsed = csvStudentRowSchema.safeParse(row);

        if (!parsed.success) {
          const msg = parsed.error.issues.map((e) => e.message).join(", ");
          errors.push({ row: rowIndex, message: msg });
          continue;
        }

        // Check duplicate email
        const existing = await prisma.student.findFirst({
          where: { email: parsed.data.email, isDeleted: false },
          select: { id: true },
        });

        if (existing) {
          errors.push({
            row: rowIndex,
            message: `Email '${parsed.data.email}' already exists`,
          });
          continue;
        }

        createData.push({
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          dateOfBirth: parsed.data.dateOfBirth
            ? new Date(parsed.data.dateOfBirth)
            : null,
          gender: parsed.data.gender ?? null,
          phone: parsed.data.phone ?? null,
          program: parsed.data.program ?? null,
          status: parsed.data.status ?? "ACTIVE",
          enrollmentDate: new Date(),
        });
      }

      // Bulk create this batch
      if (createData.length > 0) {
        const result = await prisma.student.createMany({
          data: createData,
        });
        successCount += result.count;
      }
    }

    // Audit log
    void auditLogService.create({
      action: "IMPORT",
      entity: "Student",
      userId: context.user.id,
      userName: context.user.name ?? context.user.email,
      metadata: {
        totalRows: rows.length,
        successCount,
        errorCount: errors.length,
      },
    });

    return successResponse(
      {
        totalRows: rows.length,
        successCount,
        errorCount: errors.length,
        errors: errors.slice(0, 50), // Cap error details
      },
      successCount > 0 ? 201 : 400
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export const POST = withRateLimit(
  withAuth(handlePost),
  { max: 5, windowMs: 60_000 } // Very strict for imports
);
