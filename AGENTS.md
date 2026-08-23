# AGENTS.md

Telegraph style. Root rules only. Read scoped `AGENTS.md` inside `apps/api/`, `apps/web/`, or `apps/mobile/` before touching that subtree. Skills own step-by-step workflows; root owns hard policy and business invariants.

---

## Project

BrokerOS is an Enterprise Real Estate CRM for a brokerage business. Two completely separate business lines run under one roof:

- **Brokerage** — Internal sales team sells properties to clients. Projects flagged `isCpProject = false`.
- **Channel Partner (CP)** — External broker network. Projects flagged `isCpProject = true`.

Same database. Same inventory. Separated by exactly one flag: `Project.isCpProject`. Never mix data across this boundary.

Stack: NestJS 11 backend · PostgreSQL + Prisma 7 · Next.js 16 frontend (App Router) · Expo 54 mobile (Expo Router 6). All TypeScript. Auth: Better Auth everywhere.

---

## Start

- Repo root: `BrokerOS/` — **pnpm monorepo** with Turborepo.
- Structure: `apps/` (deployable), `packages/` (shared), `integrations/` (external adapters).
- Apps: `apps/api/` (NestJS API), `apps/web/` (Next.js), `apps/mobile/` (Expo RN), `apps/workers/` (BullMQ async).
- Packages: `packages/types/` (@brokeros/types), `packages/validators/` (@brokeros/validators).
- **CRITICAL**: Before you write any code or start any task, you **MUST** read the scoped `AGENTS.md` in the corresponding subtree:
  - For ANY request related to the API, use `view_file` to read `apps/api/AGENTS.md`
  - For ANY request related to the frontend, use `view_file` to read `apps/web/AGENTS.md`
  - For ANY request related to the mobile app, use `view_file` to read `apps/mobile/AGENTS.md`
- Before proposing any custom system, check if an existing service/module/hook already handles it.
- Never hardcode env secrets. `.env.example` in each subtree is the source of truth for env vars.
- Never print secrets or tokens in logs or responses.
- Use repo-root-relative paths in all references: `apps/api/src/leads/leads.service.ts`, not absolute paths.

---

## Packages & Shared Logic

We are migrating shared business logic out of the apps and into the `packages/` directory using Turborepo workspaces.

- **`@brokeros/constants`**: Pure TS constants, enums, UI colors, and pure utility functions (e.g., Lead Statuses, Role definitions).
- **`@brokeros/types`**: Shared TypeScript interfaces and DTO definitions.
- **`@brokeros/validators`**: Shared Zod schemas for form validation and API payloads.

**CRITICAL RULES FOR AGENTS:**
1. **Gradual Migration:** This is an ongoing, chunk-by-chunk migration. Many legacy types/constants still live locally in `apps/web/` and `apps/mobile/`. **Do NOT** perform massive sweeping refactors to move hundreds of files at once.
2. **New Code:** When creating *new* shared constants, types, or Zod validators that are used across the API and frontend/mobile, put them in the respective `packages/` folder.
3. **Importing:** Import them into apps using the package name (e.g., `import { LEAD_STATUS } from '@brokeros/constants'`).
4. **No Side Effects:** Packages must be pure TypeScript. Do not include React, Next.js, or NestJS specific dependencies in `packages/`.

---

## Auth Law

- **Better Auth is the only auth system.** Do not implement custom JWT minting, custom session management, or custom password hashing.
- Backend: `@thallesp/nestjs-better-auth`. Sessions validated via the `better-auth` server instance in `apps/api/src/auth/`.
- Frontend: `better-auth` client in `apps/web/lib/auth-client.ts`. Route protection via `apps/web/middleware.ts`.
- Mobile: `@better-auth/expo` with `expo-secure-store` for token persistence.
- Role is read from `session.user.role`. Never accept role from request body or query string.
- Do not add any new passport strategy. Existing `passport-jwt` is legacy-only.

---

## Database Law

- **Prisma only.** No raw SQL strings in application code. Use the Prisma query API.
- Prisma client generated to `apps/api/src/generated/prisma`. Import from there, not from `@prisma/client`.
- After any `schema.prisma` change: `pnpm --filter @brokeros/api db:generate` → `pnpm --filter @brokeros/api db:migrate`.
- Schema file: `apps/api/prisma/schema.prisma` — single source of truth. Seed: `apps/api/prisma/seed.ts`.
- Multi-model writes must use Prisma transactions (`prisma.$transaction`).
- Never delete or edit applied migration files.
- Soft-delete pattern: `deletedAt DateTime?`. Filter `deletedAt: null` in all list queries.

## Domain Glossary

| Term | Definition |
|---|---|
| **Brokerage** | Internal sales operation. All projects: `isCpProject = false` |
| **CP / Channel Partner** | External broker network operation. All projects: `isCpProject = true` |
| **Broker** | External real-estate agent. NOT a system user. Managed as `Broker` DB record by a Sourcing Manager |
| **Lead** | A potential buyer. Fields: `status`, `temperature` (HOT/WARM/COLD), `score` (AI int), `brokerId` (CP world), `assignedUserId` |
| **Site Visit** | Physical visit to a project. GPS-verified via `SiteVisitVerification` ( selfie + coordinates) |
| **Negotiation** | Discount discussion record. Required before creating a discounted booking |
| **Booking** | Confirmed sale. Linked to a `Unit` (now SOLD), `Customer`, optionally a `Broker` |
| **Customer** | Created from Lead when booking is created. Holds post-sales identity |
| **BrokerageRecord** | Commission record per CP booking. Leads to `BrokerageSettlement` for actual payment |
| **InboundCommission** | Commission FROM the builder TO the brokerage firm for selling their unit. Tracked by Post-Sales |
| **ProjectAssignment** | Scoping table. Links a SM or CM to a specific CP project |
| **ManagerTask** | Daily cold call target set by PRE_SALES_MANAGER or SALES_MANAGER per exec |
| **DailyPerformanceLog** | Daily snapshot per exec: calls done, target, follow-ups done, missed follow-up IDs |
| **isCpProject** | The single boolean that separates the two entire business worlds |

---

## Map

- API modules (`apps/api/src/`): `auth`, `leads`, `inventory`, `brokers`, `approvals`, `chat`, `notifications`, `dashboard`.
- Web routes (`apps/web/app/`): `login` (public), `dashboard` (role-protected shell + sub-routes per role).
- Mobile route groups (`apps/mobile/app/`): `(auth)` (login/signup), `(dashboard)` (14 role-specific screen dirs).
- Workers (`apps/workers/src/`): BullMQ processors for async jobs (SMS, portal sync, AI callbacks).
- Shared packages: `packages/types/` (TS interfaces), `packages/validators/` (Zod schemas).
- Integrations: `integrations/` — one folder per external provider (telephony, messaging, portals, ads, payments, AI).
- Skills: `.agents/skills/` (root), `apps/api/.agents/skills/`, `apps/web/.agents/skills/`, `apps/mobile/.agents/skills/`.

---
