// src/app/api/openapi.json/route.ts
// GET /api/openapi.json — OpenAPI 3.0 specification

import { NextResponse } from "next/server";

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Student Management System API",
    version: "1.0.0",
    description:
      "RESTful API for managing students, authentication, and audit logs.",
    contact: { name: "SMS Team" },
  },
  servers: [
    { url: "http://localhost:3000", description: "Local development" },
    {
      url: "https://student-management-app-placio.vercel.app",
      description: "Production",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        tags: ["System"],
        responses: {
          200: {
            description: "Healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "healthy" },
                    database: { type: "string", example: "connected" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          503: { description: "Unhealthy" },
        },
      },
    },
    "/api/v1/students": {
      get: {
        summary: "List students",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by name, email, or program",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"],
            },
          },
          {
            name: "program",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "firstName",
                "lastName",
                "email",
                "enrollmentDate",
                "gpa",
                "createdAt",
              ],
              default: "createdAt",
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: "cursor",
            in: "query",
            schema: { type: "string" },
            description: "Cursor for cursor-based pagination",
          },
        ],
        responses: {
          200: {
            description: "Paginated list of students",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedStudents" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          422: { $ref: "#/components/responses/ValidationError" },
        },
      },
      post: {
        summary: "Create a student",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentCreate" },
            },
          },
        },
        responses: {
          201: {
            description: "Student created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StudentResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          409: { description: "Email already exists" },
          422: { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/api/v1/students/{id}": {
      get: {
        summary: "Get student by ID",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Student details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StudentResponse" },
              },
            },
          },
          404: { description: "Student not found" },
        },
      },
      put: {
        summary: "Update a student",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentUpdate" },
            },
          },
        },
        responses: {
          200: { description: "Student updated" },
          404: { description: "Student not found" },
          409: { description: "Concurrency conflict or duplicate email" },
          422: { $ref: "#/components/responses/ValidationError" },
        },
      },
      delete: {
        summary: "Delete a student",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "hard",
            in: "query",
            schema: { type: "boolean", default: false },
            description: "Permanently delete (admin only)",
          },
        ],
        responses: {
          200: { description: "Student deleted" },
          404: { description: "Student not found" },
        },
      },
    },
    "/api/v1/students/{id}/restore": {
      post: {
        summary: "Restore a soft-deleted student",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Student restored" },
          404: { description: "Student not found" },
        },
      },
    },
    "/api/v1/students/bulk": {
      post: {
        summary: "Bulk actions (delete)",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action", "ids"],
                properties: {
                  action: { type: "string", enum: ["delete"] },
                  ids: {
                    type: "array",
                    items: { type: "string" },
                    maxItems: 100,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Bulk action completed" },
        },
      },
    },
    "/api/v1/students/export": {
      get: {
        summary: "Export students as CSV",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "CSV file",
            content: { "text/csv": { schema: { type: "string" } } },
          },
        },
      },
    },
    "/api/v1/students/import": {
      post: {
        summary: "Import students from CSV",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Import results" },
          400: { description: "Invalid CSV" },
        },
      },
    },
    "/api/v1/students/stats": {
      get: {
        summary: "Dashboard statistics",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dashboard stats" },
        },
      },
    },
    "/api/v1/audit-logs": {
      get: {
        summary: "List audit logs (admin only)",
        tags: ["Audit"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "entity", in: "query", schema: { type: "string" } },
          { name: "entityId", in: "query", schema: { type: "string" } },
          { name: "action", in: "query", schema: { type: "string" } },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20 },
          },
        ],
        responses: {
          200: { description: "Paginated audit logs" },
          403: { description: "Forbidden — admin only" },
        },
      },
    },
    "/api/metrics": {
      get: {
        summary: "Application metrics",
        tags: ["System"],
        responses: {
          200: { description: "Metrics data" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
      },
    },
    schemas: {
      StudentCreate: {
        type: "object",
        required: ["firstName", "lastName", "email"],
        properties: {
          firstName: { type: "string", maxLength: 100 },
          lastName: { type: "string", maxLength: 100 },
          email: { type: "string", format: "email" },
          dateOfBirth: { type: "string", format: "date", nullable: true },
          gender: {
            type: "string",
            enum: ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"],
            nullable: true,
          },
          phone: { type: "string", nullable: true },
          address: { type: "string", nullable: true },
          city: { type: "string", nullable: true },
          state: { type: "string", nullable: true },
          zipCode: { type: "string", nullable: true },
          country: { type: "string", nullable: true },
          program: { type: "string", nullable: true },
          year: { type: "integer", minimum: 1, maximum: 6, nullable: true },
          gpa: { type: "number", minimum: 0, maximum: 4, nullable: true },
          status: {
            type: "string",
            enum: ["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"],
            default: "ACTIVE",
          },
          notes: { type: "string", nullable: true },
        },
      },
      StudentUpdate: {
        allOf: [
          { $ref: "#/components/schemas/StudentCreate" },
          {
            type: "object",
            required: ["version"],
            properties: {
              version: {
                type: "integer",
                description: "Optimistic concurrency version",
              },
            },
          },
        ],
      },
      StudentResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { $ref: "#/components/schemas/StudentCreate" },
        },
      },
      PaginatedStudents: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/StudentCreate" },
          },
          meta: {
            type: "object",
            properties: {
              total: { type: "integer" },
              page: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
              hasMore: { type: "boolean" },
              nextCursor: { type: "string", nullable: true },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Authentication required",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                error: {
                  type: "object",
                  properties: {
                    code: { type: "string", example: "UNAUTHORIZED" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
      ValidationError: {
        description: "Validation failed",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: false },
                error: {
                  type: "object",
                  properties: {
                    code: { type: "string", example: "VALIDATION_ERROR" },
                    message: { type: "string" },
                    details: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
