# AGENTS.md — backend/

Read root `AGENTS.md` first. This file adds backend-only rules. Root owns business invariants; this file owns NestJS-specific mechanics.

---

## Tech

NestJS 11 · TypeScript ESM (`"type": "module"` in package.json) · Prisma 7 · PostgreSQL · Better Auth 1.x · Socket.IO 4 · `@nestjs/schedule` for cron jobs.

---

## Module Pattern

One NestJS module per domain. Module = `*.module.ts` + one or more controllers + one or more services. All wired in `src/app.module.ts`.

```
backend/src/
  auth/            → AuthModule
  leads/           → LeadsModule  (sub-dirs: core, bookings, call-records, follow-ups, notes, site-visits)
  inventory/       → InventoryModule  (sub-dirs: core, projects, towers, units, documents)
  brokers/         → BrokersModule
  approvals/       → ApprovalsModule
  chat/            → ChatModule  (Socket.IO gateway)
  notifications/   → NotificationsModule  (Socket.IO gateway + Expo Push)
  dashboard/       → DashboardModule  (sub-dirs per role: pre-sales, sales-exec, sales-manager, post-sales, sourcing-manager, closing-manager, channel-partner, business-manager, manager, employees, core)
  lib/
    auth.ts          ← Better Auth server instance (betterAuth config)
    database/        ← PrismaModule, prisma-client singleton
    storage/         ← Vercel Blob helpers
```

---

## Prisma Rules

- Import client from `src/lib/database/prisma-client.js` (the singleton) or inject `PrismaService` from `PrismaModule`. Never import from `@prisma/client` directly.
- Prisma client output: `src/generated/prisma`. Do not edit any file in that directory.
- After any schema change: `pnpm db:generate` then `pnpm db:migrate`.
- `DashboardCache` model exists for caching heavy dashboard queries. Check it before hitting raw Prisma in high-traffic dashboard endpoints.

---

## Scripts

Run from `backend/`:

```bash
pnpm start:dev          # dev server (watch mode)
pnpm build              # compile to dist/
pnpm db:generate        # regenerate Prisma client
pnpm db:migrate         # run pending DB migrations
pnpm db:studio          # Prisma Studio GUI
pnpm db:format          # format schema.prisma
pnpm test               # Jest unit tests
pnpm test:e2e           # e2e tests
```