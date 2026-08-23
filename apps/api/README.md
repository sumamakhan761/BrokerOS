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
│   ├── auth.ts                Better Auth server instance config
│   ├── database/              PrismaModule + PrismaService singleton
│   └── storage/               Vercel Blob upload/download helpers
│
└── generated/         Prisma client output — DO NOT EDIT
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

You must configure your `apps/api/.env` file properly before starting the server.
```bash
cd apps/api
cp .env.example .env
```

#### A. Database Configuration (`DATABASE_URL`)
You have three options for your PostgreSQL database:

*   **Option 1: Local Docker (Recommended)**
    If you ran `docker compose up postgres` in the root folder, the database is ready. 
    Use: `DATABASE_URL="postgresql://crm:crm@localhost:5432/crm"`
    *(Note: If running the backend itself inside Docker, the host becomes `postgres` instead of `localhost`).*

*   **Option 2: Cloud DB (Neon / Supabase)**
    Create a free account on [Neon](https://neon.tech/).
    Use: `DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"`

*   **Option 3: Local Native Install**
    Use: `DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/crm"`

#### B. Authentication (`BETTER_AUTH_SECRET`)
Better Auth requires a strong, randomly generated 32-character secret to sign sessions.
Run this command in your terminal to generate one:
```bash
openssl rand -hex 32
```
Set in `.env`:
`BETTER_AUTH_SECRET="your-generated-hash-here"`
`BETTER_AUTH_URL="http://localhost:3333"` *(Keep this default for local dev)*

#### C. External Cloud Services
These power the file uploads and AI functionalities.

*   **Vercel Blob (File Uploads)**: Go to [Vercel Storage](https://vercel.com/storage/blob) to get your token.
    `BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"`
*   **Groq (AI Call Processing)**: Go to [Groq Console](https://console.groq.com/keys) to get a free API key.
    `GROQ_API_KEY="gsk_your_key_here"`

#### D. CORS & URLs
*   `FRONTEND_URL="http://localhost:3000"`
*   `MOBILE_URL="exp://192.168.x.x:8081"` *(CRITICAL: Replace with your actual LAN IP. Mobile physical devices cannot connect to `localhost`).*

### 3. Database Initialization

Once your `.env` is configured, set up Prisma:

```bash
pnpm db:generate           # Generate Prisma client
pnpm db:migrate            # Run migrations to create tables
pnpm db:seed               # Populate database with sample data
```

### 4. Run & Test

```bash
pnpm start:dev             # Dev server with watch mode → http://localhost:3333
pnpm start:prod            # Production mode (compile first with pnpm build)

pnpm test                  # Jest unit tests
pnpm test:e2e              # End-to-end tests
```

---

## Docker

The backend has a multi-stage Dockerfile (`Dockerfile`) that:

1. **Stage 1 (deps):** Installs pnpm, copies lockfile + Prisma schema, runs `pnpm install --frozen-lockfile`
2. **Stage 2 (build):** Generates Prisma client, compiles TypeScript to `dist/`
3. **Stage 3 (runner):** Copies only `dist/`, `node_modules/`, and `prisma/` — runs `prisma migrate deploy` then starts the server

```bash
# Run via docker compose from the repo root (recommended):
docker compose up backend

# Or build standalone:
docker build -t crm-backend .
```

The backend runs on port **3333** by default.

<div align="center">

**[← Back to main README](../README.md)**

</div>
