<div align="center">

# Frontend — BrokerOS

**Next.js 16 web dashboard with role-based views**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

The frontend is a Next.js 16 App Router application that serves as the web dashboard for the CRM. It provides 12 role-specific views — each role sees a tailored sidebar, dashboard, and feature set based on their `session.user.role`.

## Directory Structure

```
apps/web/
├── app/
│   ├── layout.tsx              Root HTML shell, fonts, providers
│   ├── globals.css             Global CSS + Tailwind v4 imports
│   ├── page.tsx                Root redirect → /dashboard or /login
│   ├── login/                  Public login page (no auth guard)
│   └── dashboard/
│       ├── layout.tsx          THE MAIN SHELL — role-based sidebar,
│       │                       NotificationBell, ChatWidget
│       ├── page.tsx            Dashboard home (redirects to role view)
│       ├── business-manager/   Business Manager screens
│       ├── channel-partner/    Channel Partner screens
│       ├── closing-manager/    Closing Manager screens
│       ├── director/           Director screens
│       ├── finance/            Finance screens
│       ├── post-sales/         Post-Sales screens
│       ├── pre-sales/          Pre-Sales screens
│       ├── pre-sales-manager/  Pre-Sales Manager screens
│       ├── sales/              Sales screens
│       ├── sales-executive/    Sales Executive screens
│       ├── sales-manager/      Sales Manager screens
│       └── sourcing-manager/   Sourcing Manager screens
│
├── features/                   Domain feature UI
│   ├── leads/                  Lead list, detail, follow-ups, call history
│   ├── inventory/              Project/unit browser
│   ├── brokers/                Broker management
│   └── approvals/              Approval request UI
│
├── components/                 Shared components
│   ├── analytics/              Recharts-based chart components
│   ├── chat/                   ChatWidget (Socket.IO driven)
│   ├── commissions/            Commission display components
│   ├── dashboard/              Dashboard card/widget components
│   ├── leads/                  Lead-specific shared components
│   ├── notifications/          NotificationBell component
│   ├── payments/               Payment display components
│   └── ui/                     Primitive UI elements
│
├── lib/
│   ├── auth-client.ts          Better Auth client (createAuthClient)
│   └── utils.ts                Shared utility functions
│
└── middleware.ts               Route protection (cookie-based session check)
```

## Development

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- Running backend (for API calls)

### 1. Installation

This project is part of a pnpm monorepo. Install dependencies from the root directory:

```bash
cd ../../  # Go to BrokerOS root
pnpm install
```

### 2. Environment Setup

You must configure your `apps/web/.env` file properly before starting the dev server.
```bash
cd apps/web
cp .env.example .env
```

#### A. API Configuration
The frontend uses a proxy pattern. In local development, client-side requests go through Next.js to avoid CORS issues.
*   `NEXT_PUBLIC_API_URL="/api/proxy"` *(Keep this default for local dev)*
*   `BACKEND_URL="http://localhost:3333"` *(This is the direct server-side connection to your NestJS backend)*

#### B. App URL
Used for authentication callbacks and Next.js internal redirects.
*   `NEXT_PUBLIC_APP_URL="http://localhost:3000"`

#### C. Mapbox (Required for CP & Sales)
The CRM relies on Mapbox for GPS-verified field meetings (Sourcing Managers) and site visits (Sales Executives).
1. Go to [Mapbox Account](https://account.mapbox.com/).
2. Create an account and generate an access token.
3. Set it in your `.env` file:
   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-mapbox-access-token-here"`

### 3. Run & Build

All commands should be executed from the **monorepo root**:

#### Development
```bash
pnpm dev:web                                  # Dev server → http://localhost:3000
# OR using workspace filter directly:
pnpm --filter @brokeros/web dev
```

#### Production
```bash
pnpm --filter @brokeros/web build             # Production build
pnpm --filter @brokeros/web start             # Serve production build
```

---

## API Communication

The frontend uses a proxy pattern to communicate with the backend:

- **Client-side:** Requests go to `/api/proxy/*` which Next.js proxies to the backend.
- **Server-side:** Uses the `BACKEND_URL` environment variable directly.
- **Real-time:** Socket.IO client connects directly to the backend for chat and notifications.

---

## Docker

The frontend uses a highly optimized multi-stage Dockerfile powered by Turborepo:

1. **Stage 1 (Prune):** Runs `turbo prune @brokeros/web` to isolate only the frontend code and its internal workspace dependencies (like `@brokeros/constants`).
2. **Stage 2 (Installer):** Installs dependencies, bakes `NEXT_PUBLIC_*` env vars, and runs the Next.js standalone build.
3. **Stage 3 (Runner):** A lightweight Alpine image that runs the compiled Next.js standalone server as a non-root user.

**Crucial Note:** Because it relies on Turborepo, the Dockerfile **must be built from the monorepo root context**, not from inside `apps/web/`.

```bash
# Run via docker compose from the repo root (recommended):
docker compose up --build frontend
```

The frontend runs on port **3000** by default.

---

<div align="center">

**[← Back to main README](../README.md)**

</div>
