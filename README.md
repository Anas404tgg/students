# Student Management System

A production-ready Student Management System built with **Next.js 14**, **Prisma**, **TypeScript**, and **TailwindCSS**.

## Features

- **Authentication** — Secure email/password login with JWT sessions (NextAuth)
- **Student CRUD** — Create, read, update, soft-delete, restore, and bulk operations
- **CSV Import/Export** — Bulk import students via CSV; export filtered data
- **Dashboard** — Statistics, GPA distribution, enrollment status overview
- **Admin Panel** — User management, audit logs, role-based access control
- **API** — RESTful v1 API with rate limiting, pagination, and OpenAPI spec
- **Audit Trail** — Every data change is logged with user, IP, and diff
- **Search & Filter** — Full-text search, status/program/year filtering

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.6 (strict) |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Auth | NextAuth 4.24 (JWT, Credentials) |
| Styling | TailwindCSS 3.4, CVA, Headless UI |
| Testing | Vitest + Testing Library (106 tests) |
| CI/CD | GitHub Actions |
| Container | Docker (multi-stage) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd students_management

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.example .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Default Admin Account

| Field | Value |
|-------|-------|
| Email | admin@sms.dev |
| Password | Admin@123456 |

## Scripts

```bash
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Lint code
npm run typecheck     # TypeScript type checking
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed the database
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset database (destructive)
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, register, forgot-password)
│   ├── (dashboard)/         # Protected pages (dashboard, students, settings, admin)
│   └── api/
│       ├── auth/            # NextAuth handler
│       ├── health/          # Health check endpoint
│       ├── metrics/         # Application metrics
│       ├── openapi.json/    # OpenAPI specification
│       └── v1/              # API v1
│           ├── auth/        # Auth endpoints (register, profile, password)
│           ├── students/    # Student CRUD, import, export, stats
│           ├── users/       # User management (admin)
│           └── audit-logs/  # Audit log viewer (admin)
├── components/
│   ├── layout/              # App shell, sidebar, header
│   ├── providers/           # Session and toast providers
│   ├── students/            # Student form component
│   └── ui/                  # Reusable UI primitives (button, input, card, etc.)
├── hooks/                   # Custom React hooks
├── lib/
│   ├── auth/                # Password hashing, JWT token utils
│   ├── middleware/           # Auth and rate-limit middleware
│   └── *.ts                 # Utilities, validators, errors, API client
├── services/                # Business logic (student, user, audit-log)
└── test/                    # Test setup and mocks
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out |
| POST | `/api/v1/auth/register` | Register a new user |
| GET/PUT | `/api/v1/auth/profile` | Get or update user profile |
| POST | `/api/v1/auth/change-password` | Change password |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/students` | List students (paginated, filterable) |
| POST | `/api/v1/students` | Create a student |
| GET | `/api/v1/students/:id` | Get student details |
| PUT | `/api/v1/students/:id` | Update a student |
| DELETE | `/api/v1/students/:id` | Soft-delete a student |
| POST | `/api/v1/students/:id/restore` | Restore a deleted student |
| DELETE | `/api/v1/students/bulk` | Bulk delete students |
| GET | `/api/v1/students/stats` | Student statistics |
| GET | `/api/v1/students/export` | Export students as CSV |
| POST | `/api/v1/students/import` | Import students from CSV |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List users (admin only) |
| POST | `/api/v1/users/:id/toggle-active` | Activate/deactivate user (admin) |
| GET | `/api/v1/audit-logs` | View audit logs (admin only) |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/metrics` | Application metrics |
| GET | `/api/openapi.json` | OpenAPI specification |

## Docker

### Build and run with Docker Compose

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f app

# Stop
docker compose down
```

### Build image directly

```bash
docker build -t sms-app .
docker run -p 3000:3000 --env-file .env sms-app
```

## CI/CD

The GitHub Actions pipeline runs on every push and pull request:

1. **Lint & Format** — ESLint + Prettier checks
2. **Type Check** — TypeScript strict mode verification
3. **Unit Tests** — Vitest test suite with coverage
4. **Build** — Production build verification (runs after all checks pass)

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Database connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `NEXTAUTH_URL` | Yes | Application URL |
| `NODE_ENV` | No | `development` / `production` / `test` |
| `APP_NAME` | No | Application display name |
| `LOG_LEVEL` | No | Logging level (`debug`, `info`, `warn`, `error`) |

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

Tests cover:
- **Utilities** — formatters, classname merging, date helpers
- **Validators** — Zod schema validation for all entities
- **Error handling** — Custom error classes and API error responses
- **Rate limiting** — In-memory rate limiter
- **Auth** — Password hashing/comparison, token generation/verification
- **Services** — Student CRUD, audit log creation
- **UI Components** — Button, Badge, Input, Card rendering and variants

## License

MIT
