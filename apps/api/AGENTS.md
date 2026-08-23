# AGENTS.md — apps/api/
---

## Tech

NestJS 11 · TypeScript ESM (`"type": "module"` in package.json) · Prisma 7 · PostgreSQL · Better Auth 1.x · Socket.IO 4 · `@nestjs/schedule` for cron jobs.

---

## Prisma Rules

- Import client from `src/lib/database/prisma-client.js` (the singleton) or inject `PrismaService` from `PrismaModule`. Never import from `@prisma/client` directly.
- Prisma client output: `src/generated/prisma`. Do not edit any file in that directory.
- After any schema change: `pnpm db:generate` then `pnpm db:migrate`.
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
  `.agents/skills/prisma-client-api/SKILL.md`
---

## Scripts

> **CRITICAL SCRIPTING RULE:** If you are creating a new utility, database migration, or maintenance script, DO NOT put it inside `apps/api/scripts/`. Create it in the monorepo root at `scripts/` and execute it from the root using `pnpm run script scripts/your-script.ts`.

Run from `apps/api/` directory (or use `pnpm --filter @brokeros/api <cmd>` from root):

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