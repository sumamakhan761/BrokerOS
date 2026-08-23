<div align="center">

# Backend — BrokerOS

**NestJS 11 REST API + Socket.IO real-time server**

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ESM-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

The backend is a modular NestJS 11 application written in TypeScript ESM. It serves the REST API consumed by the Next.js frontend and the Expo mobile app, and runs Socket.IO gateways for real-time chat and notifications.

---

## Module Architecture

```
apps/api/src/
├── auth/              Authentication & authorization
│   ├── auth.controller.ts     Auth endpoints (login, logout, session)
│   ├── roles.guard.ts         RBAC guard — checks session.user.role
│   └── roles.decorator.ts     @Roles() decorator for endpoints
│
├── leads/             Lead lifecycle management
│   ├── core/                  Lead CRUD, assignment, scoring
│   ├── bookings/              Booking creation, customer conversion
│   ├── call-records/          Call logging + AI transcription
│   ├── follow-ups/            Scheduled follow-up management
│   ├── notes/                 Lead notes
│   └── site-visits/           GPS-verified site visits + selfie upload
│
├── inventory/         Property inventory
│   ├── core/                  Project, tower, floor, unit CRUD
│   ├── projects/              Builder → Project management
│   ├── towers/                Tower configuration
│   ├── units/                 Unit status (Available → Blocked → Sold)
│   └── documents/             Price sheets, floor plans, offers, construction updates
│
├── brokers/           Channel Partner broker management
│   └── *                      Broker CRUD, meetings, referrals, settlements, KYC docs
│
├── approvals/         Multi-step approval workflows
│   └── *                      ApprovalRequest + FinancialApproval
│
├── chat/              Real-time messaging
│   └── *                      Socket.IO gateway, chat rooms, messages
│
├── notifications/     Push & in-app notifications
│   └── *                      Socket.IO gateway + Expo Push SDK
│
├── dashboard/         Role-specific analytics (largest module)
│   ├── core/                  Shared dashboard utilities, caching
│   ├── pre-sales/             Pre-sales exec daily performance
│   ├── sales-exec/            Sales pipeline & conversion metrics
│   ├── sales-manager/         Team oversight & approvals
│   ├── post-sales/            Loan, agreement, possession tracking
│   ├── sourcing-manager/      Broker recruitment metrics
│   ├── closing-manager/       On-site booking analytics
│   ├── channel-partner/       CP-wide performance
│   ├── business-manager/      Cross-business overview
│   ├── manager/               Shared manager utilities
│   └── employees/             Employee performance tracking
│
├── lib/               Shared infrastructure
│   ├── database/              PrismaModule wrapper around @brokeros/prisma
│   └── storage/               Vercel Blob upload/download helpers
```

## Development

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- PostgreSQL 16+ (via Docker, local install, or cloud like [Neon](https://neon.tech))

### 1. Installation

This project is part of a pnpm monorepo. Install dependencies from the root directory:

```bash
cd ../../  # Go to BrokerOS root
pnpm install
```

### 2. Environment Setup

This monorepo uses a **Split Environment Architecture**.

#### A. Root Infrastructure (`/.env`)
The heavy infrastructure secrets must be placed in the **root** `.env` file (at `../../.env`).
```

Populate these in the **root `.env`**:
- **`DATABASE_URL`**: Use `postgresql://crm:crm@localhost:5432/crm` for local Docker, or a cloud Neon URL.
- **`BETTER_AUTH_SECRET`**: Generate one with `openssl rand -hex 32`.
- **`BLOB_READ_WRITE_TOKEN`**: From Vercel Storage.
- **`GROQ_API_KEY`**: From Groq Console.

#### B. API Local Overrides (`apps/api/.env`)
The API-specific environment file is strictly for local routing.
Create it:
```bash
cp .env.example .env
```

Populate these in `apps/api/.env`:
- `FRONTEND_URL="http://localhost:3000"`
- `MOBILE_URL="exp://192.168.x.x:8081"` *(CRITICAL: Replace with your actual LAN IP. Mobile physical devices cannot connect to `localhost`).*

### 3. Database Initialization

Once your `.env` is configured, set up Prisma (now located in `@brokeros/prisma`):

```bash
pnpm --filter @brokeros/prisma db:generate           # Generate Prisma client
pnpm --filter @brokeros/prisma db:migrate            # Run migrations to create tables
pnpm --filter @brokeros/prisma db:seed               # Populate database with sample data
```

### 4. Run & Test

```bash
pnpm start:dev             # Dev server with watch mode → http://localhost:3333
pnpm start:prod            # Production mode (compile first with pnpm build)

# Testing & Typechecking
npx tsc --noEmit           # Run strict TypeScript typechecking without compiling
pnpm test                  # Run all Jest unit tests (*.spec.ts)
pnpm test path/to/file     # Run a specific .spec.ts file
pnpm test:e2e              # Run end-to-end tests
```

---

## Docker

The backend uses a highly optimized multi-stage Dockerfile powered by Turborepo:

1. **Stage 1 (Prune):** Runs `turbo prune @brokeros/api` to isolate only the backend code and its internal dependencies (like `@brokeros/prisma`).
2. **Stage 2 (Installer):** Installs dependencies and runs the build.
3. **Stage 3 (Runner):** A lightweight Alpine image that runs the compiled API.

**Crucial Note:** Because it relies on Turborepo, the Dockerfile **must be built from the root context**, not from inside `apps/api/`.

```bash
# Run via docker compose from the repo root (recommended):
docker compose up --build backend
```

The backend runs on port **3333** by default.

<div align="center">

**[← Back to main README](../README.md)**

</div>
