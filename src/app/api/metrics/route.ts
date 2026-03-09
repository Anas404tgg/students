// src/app/api/metrics/route.ts
// GET /api/metrics — Application metrics for observability

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    const [userCount, studentCount, auditCount] = await Promise.all([
      prisma.user.count(),
      prisma.student.count({ where: { isDeleted: false } }),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          unit: "MB",
        },
        database: {
          users: userCount,
          students: studentCount,
          auditLogs: auditCount,
          queryTimeMs: Date.now() - start,
        },
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
