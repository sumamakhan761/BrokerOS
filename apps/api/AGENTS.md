# AGENTS.md — apps/api/
---

## Tech

NestJS 11 · TypeScript ESM (`"type": "module"` in package.json) · Prisma 7 · PostgreSQL · Better Auth 1.x · Socket.IO 4 · `@nestjs/schedule` for cron jobs.

---

## Prisma Rules

- Import client via `@brokeros/prisma` (from `packages/prisma/generated/client`) or inject `PrismaService` from `PrismaModule`. Never import from `@prisma/client` directly.
- Prisma client schema and migrations live in `packages/prisma/`. Do not edit generated files.
- After any schema change: `pnpm --filter @brokeros/prisma db:generate` then `pnpm --filter @brokeros/prisma db:migrate`.
- `DashboardCache` model exists for caching heavy dashboard queries. Check it before hitting raw Prisma in high-traffic dashboard endpoints.

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