# AGENTS.md — apps/api/

---

## Tech

NestJS 11 · TypeScript ESM (`"type": "module"` in package.json) · Prisma 7 · PostgreSQL · Better Auth 1.x · Socket.IO 4 · BullMQ (job enqueuing) · `@nestjs/schedule` for cron jobs.

---

## Prisma Rules

- Import client via `@brokeros/prisma` (from `packages/prisma/generated/client`) or inject `PrismaService` from `PrismaModule`. Never import from `@prisma/client` directly.
- Prisma client schema and migrations live in `packages/prisma/`. Do not edit generated files.
- After any schema change: `pnpm --filter @brokeros/prisma db:generate` then `pnpm --filter @brokeros/prisma db:migrate`.
- `DashboardCache` model exists for caching heavy dashboard queries. Check it before hitting raw Prisma in high-traffic dashboard endpoints.

---

## Module Architecture

```
apps/api/src/
├── auth/              Better Auth + RBAC guards (roles.guard.ts, roles.decorator.ts)
├── leads/             Lead lifecycle
│   ├── core/          Lead CRUD, assignment, scoring, media
│   ├── bookings/      Booking creation, customer conversion, post-sales, payments
│   ├── call-records/  Call logging + Groq AI transcription
│   ├── follow-ups/    Scheduled follow-up management
│   ├── notes/         Lead notes
│   └── site-visits/   GPS-verified site visits + selfie upload
│
├── inventory/         Property inventory
│   ├── projects/      Builder → Project management
│   ├── towers/        Tower config + AI generation (Groq)
│   ├── units/         Unit status (Available → Blocked → Sold)
│   └── documents/     Price sheets, floor plans, offers, construction updates
│
├── brokers/           CP broker management (CRUD, meetings, referrals, settlements, KYC)
├── approvals/         Multi-step approval workflows (ApprovalRequest + FinancialApproval)
├── chat/              Socket.IO gateway — chat rooms + messages
├── notifications/     Socket.IO gateway + Expo Push SDK
│
├── dashboard/         12 role-specific analytics modules
│   ├── pre-sales/     Pre-sales exec daily performance (analytics, daily-tasks, leaderboard, pipeline, widgets)
│   ├── sales-exec/    Sales pipeline & conversion (analytics, daily-tasks, leaderboard, widgets)
│   ├── sales-manager/ Team oversight & approvals
│   ├── post-sales/    Loan, agreement, possession tracking
│   ├── sourcing-manager/ Broker recruitment metrics
│   ├── closing-manager/  On-site booking analytics
│   ├── channel-partner/  CP-wide performance
│   ├── business-manager/ Cross-business overview
│   ├── manager/       Shared manager utilities
│   └── employees/     Employee performance tracking
│
│   ├── marketing/         Omnichannel marketing campaigns (Email · SMS · AI Voice · WhatsApp · Ads)
│   │   ├── marketing.module.ts   Root module, registers all sub-modules + services
│   │   ├── shared/        shared/sample-csv.controller.ts — CSV template downloads
│   │   │
│   │   ├── email/         Email Campaign Module (controllers, services, facade)
│   │   ├── sms/           SMS Campaign Module (controllers, services, facade)
│   │   ├── voice/         AI Voice Campaign Module (controllers, gateway, services, facade)
│   │   ├── whatsapp/      WhatsApp Cloud API Module (broadcasts, automations, templates, webhooks)
│   │   └── ads/           Ad platform lead ingestion (google, meta, instagram, youtube webhooks)
│   │
│   └── lib/               Shared infrastructure
│       ├── database/      PrismaModule wrapper around @brokeros/prisma
│       └── storage/       Vercel Blob upload/download helpers
```

---

## Skills

You **MUST** consult the appropriate skill before making changes, based on the task you are doing:

- **Building/Modifying Features**: If you are asked to build a new feature, endpoint, or modify a module, services, specs, e2e read:
  `.agents/skills/build-backend-feature/SKILL.md`
- **NestJS Architecture & Patterns**: For specific instructions on routing, dependency injection, DTOs, and controllers, read:
  `.agents/skills/nestjs-expert/SKILL.md`
- **Auth & Sessions**: If the task involves Better Auth, user sessions, or plugins, read:
  `.agents/skills/better-auth-best-practices/SKILL.md`
- **Database & Prisma**: If the task involves complex queries, relations, or transactions, read:
  `../../.agents/skills/prisma-client-api/SKILL.md` (Monorepo root)

---

## Marketing Module Conventions

- Channels (email, sms, voice, whatsapp, ads) follow the established pattern: controllers → services → dto.
- Facades (`email.service.ts`, `sms.service.ts`, `voice.service.ts`, `whatsapp.service.ts`) are coordinator-only — they delegate to sub-services and must stay < 200 lines.
- All sub-services are single-responsibility:
  - Voice: `voice-campaign.service.ts` (lifecycle), `voice-dispatcher.service.ts` (dispatch via carrier bridge), `voice-analytics.service.ts`, `voice-audience.service.ts`.
  - WhatsApp: `broadcasts/`, `automations/`, `templates/`, `messages/`, `webhooks/`.
  - Ads: Ingestion webhooks for Google, Meta, Instagram, and YouTube.
- All external provider calls go through `integrations/` adapters. Never call external SDKs (Vapi/Retell/SendGrid/WhatsApp Cloud API) directly from a NestJS service.
- Heavy broadcast dispatch jobs MUST be enqueued to BullMQ (`apps/workers`) rather than run inside the request thread.
- DTO decomposition: split into focused DTOs and re-export cleanly.

---

## Scripts

> **CRITICAL SCRIPTING RULE:** If you are creating a new utility, database migration, or maintenance script, DO NOT put it inside `apps/api/scripts/`. Create it in the monorepo root at `scripts/` and execute it from the root using `pnpm run script scripts/your-script.ts`.

Run from repository root:

```bash
pnpm dev:api                     # dev server (watch mode) (or pnpm --filter @brokeros/api start:dev)
pnpm --filter @brokeros/api build # compile to dist/
pnpm --filter @brokeros/api test  # Jest unit tests
pnpm --filter @brokeros/api test:e2e # e2e tests

# Database commands now belong to the @brokeros/prisma package. Run from root:
pnpm db:generate                 # or pnpm --filter @brokeros/prisma db:generate
pnpm db:migrate                  # or pnpm --filter @brokeros/prisma db:migrate
pnpm db:seed                     # or pnpm --filter @brokeros/prisma db:seed
pnpm --filter @brokeros/prisma db:studio
pnpm --filter @brokeros/prisma db:format
```
