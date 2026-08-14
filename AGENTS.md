# AGENTS.md

Telegraph style. Root rules only. Read scoped `AGENTS.md` inside `backend/`, `frontend/`, or `mobile/` before touching that subtree. Skills own step-by-step workflows; root owns hard policy and business invariants.

---

## Project

OpenEstate is an Enterprise Real Estate CRM for a brokerage business. Two completely separate business lines run under one roof:

- **Brokerage** — Internal sales team sells properties to clients. Projects flagged `isCpProject = false`.
- **Channel Partner (CP)** — External broker network. Projects flagged `isCpProject = true`.

Same database. Same inventory. Separated by exactly one flag: `Project.isCpProject`. Never mix data across this boundary.

Stack: NestJS 11 backend · PostgreSQL + Prisma 7 · Next.js 16 frontend (App Router) · Expo 54 mobile (Expo Router 6). All TypeScript. Auth: Better Auth everywhere.

---

## Start

- Repo root: `OpenEstate/`
- Three subtrees: `backend/` (NestJS API), `frontend/` (Next.js web), `mobile/` (Expo RN app).
- Read the scoped `AGENTS.md` in the subtree you are working in before writing code.
- Before proposing any custom system, check if an existing service/module/hook already handles it.
- Never hardcode env secrets. `.env.example` in each subtree is the source of truth for env vars.
- Never print secrets or tokens in logs or responses.
- Use repo-root-relative paths in all references: `backend/src/leads/leads.service.ts`, not absolute paths.

---

## Roles

Twelve roles exist. Role string values are SCREAMING_SNAKE_CASE exactly as in the DB enum.

| Role | Business Line | Summary |
|---|---|---|
| `ADMIN` | Both | Full access, super admin |
| `DIRECTOR` | Brokerage | Top-level brokerage view |
| `BUSINESS_MANAGER` | Both | Cross-business oversight (currently placeholder dashboards) |
| `PRE_SALES_MANAGER` | Brokerage | Manages cold-call team, sets daily targets, assigns leads |
| `PRE_SALES` | Brokerage | Cold-call exec — makes calls, logs daily performance, schedules follow-ups |
| `SALES_EXECUTIVE` | Brokerage | Full sales exec — site visits, negotiations, creates bookings |
| `SALES_MANAGER` | Brokerage | Manages sales exec team, approves discounts |
| `POST_SALES` | Brokerage | Post-booking pipeline: loan → agreement → possession → handover |
| `CHANNEL_PARTNER` | CP | Boss of the CP world, owns all CP projects |
| `SOURCING_MANAGER` | CP | Recruits and manages external brokers |
| `CLOSING_MANAGER` | CP | Sits at project site, creates bookings for broker leads |
| `FINANCE` | Both | Commissions, expenses, invoices, settlements |

Role is stored on `User.role`. Guards: `backend/src/auth/roles.guard.ts`. Decorator: `@Roles()` from `backend/src/auth/roles.decorator.ts`. Every new endpoint must declare its required role(s).

---

## Architecture

```
backend/src/
  auth/          ← Better Auth integration, JWT guards, roles guard, roles decorator
  leads/         ← Leads, follow-ups, call-records, notes, site-visits, bookings, payments
  inventory/     ← Projects, towers, floors, units, documents, offers, price sheets
  brokers/       ← Broker CRUD, meetings, referrals, brokerage settlements, broker AI
  approvals/     ← ApprovalRequest + FinancialApproval
  chat/          ← Socket.IO chat rooms and messages
  notifications/ ← Push notifications (Expo) + in-app notifications
  dashboard/     ← Role-specific dashboard and analytics services (largest module)
  lib/           ← Shared utilities, Prisma module
  generated/     ← Prisma client output — DO NOT EDIT MANUALLY

frontend/
  app/
    login/       ← Public login page
    dashboard/   ← Protected shell: role-based sidebar + role sub-routes per role
  features/      ← Domain feature code (leads, inventory, brokers, approvals)
  components/    ← Shared UI (NotificationBell, ChatWidget, analytics, UI primitives)
  lib/           ← Auth client, API helpers, utilities

mobile/
  app/
    (auth)/      ← Login/signup screens
    (dashboard)/ ← Role-based tab navigator + all role screens (14 role dirs)
  components/    ← Shared React Native components
  lib/           ← API client, auth hooks, socket connection
  modules/
    auto-dialer/ ← Custom native module — local package, do not npm install
```

---

## Auth Law

- **Better Auth is the only auth system.** Do not implement custom JWT minting, custom session management, or custom password hashing.
- Backend: `@thallesp/nestjs-better-auth`. Sessions validated via the `better-auth` server instance in `backend/src/auth/`.
- Frontend: `better-auth` client in `frontend/lib/auth-client.ts`. Route protection via `frontend/middleware.ts`.
- Mobile: `@better-auth/expo` with `expo-secure-store` for token persistence.
- Role is read from `session.user.role`. Never accept role from request body or query string.
- Do not add any new passport strategy. Existing `passport-jwt` is legacy-only.

---

## Database Law

- **Prisma only.** No raw SQL strings in application code. Use the Prisma query API.
- Prisma client generated to `backend/src/generated/prisma`. Import from there, not from `@prisma/client`.
- After any `schema.prisma` change: `pnpm db:generate` → `pnpm db:migrate`.
- Schema file: `backend/prisma/schema.prisma` — single source of truth. Seed: `backend/prisma/seed.ts`.
- Multi-model writes must use Prisma transactions (`prisma.$transaction`).
- Never delete or edit applied migration files.
- Soft-delete pattern: `deletedAt DateTime?`. Filter `deletedAt: null` in all list queries.

---

## File Storage Law

- **Vercel Blob** for all file uploads. Package: `@vercel/blob` in backend.
- Upload endpoint returns a Blob URL; client reads directly from Vercel Blob CDN.

---

## Push Notifications Law

- Expo Push SDK (`expo-server-sdk`) in backend sends all push notifications to mobile devices.
- Device tokens stored in `User.expoPushToken`. Registered from mobile on successful login.
- Do not use Firebase Cloud Messaging directly. All push goes via Expo Push Service.

---

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

- Backend modules: `auth`, `leads`, `inventory`, `brokers`, `approvals`, `chat`, `notifications`, `dashboard`.
- Frontend routes: `app/login` (public), `app/dashboard` (role-protected shell + sub-routes per role).
- Mobile route groups: `app/(auth)` (login/signup), `app/(dashboard)` (14 role-specific screen dirs).
- Skills: `.agents/skills/` (root), `backend/.agents/skills/`, `frontend/.agents/skills/`, `mobile/.agents/skills/`.

---

## Scripts

```bash
# Backend — run from backend/
pnpm start:dev        # dev server with watch
pnpm db:generate      # regenerate Prisma client after schema change
pnpm db:migrate       # run pending migrations (creates migration file)
pnpm db:studio        # open Prisma Studio GUI
pnpm test             # unit tests (Jest)
pnpm test:e2e         # e2e tests

# Frontend — run from frontend/
pnpm dev              # Next.js dev server (port 3000)

# Mobile — run from mobile/
npx expo start        # Expo dev server
npx expo run:android  # build + run on Android emulator/device
```

---
