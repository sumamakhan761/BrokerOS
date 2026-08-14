# AGENTS.md — frontend/

Read root `AGENTS.md` first. This file adds frontend-only rules. Root owns business invariants; this file owns Next.js 16 App Router mechanics for this project.

---

**Tailwind v4 note:** This project uses Tailwind CSS v4, NOT v3. The config format, plugin API, and some utility names differ. Check `postcss.config.mjs` and `app/globals.css` before writing any Tailwind classes.

---

## Directory Structure

```
frontend/
  app/
    layout.tsx         ← Root layout (HTML shell, fonts)
    globals.css        ← Global CSS + Tailwind v4 imports
    page.tsx           ← Root redirect (sends to /dashboard or /login)
    login/             ← Public page — no auth guard
    dashboard/
      layout.tsx       ← THE MAIN SHELL: role-based sidebar, NotificationBell, ChatWidget
                         Reads role from session, renders role-specific nav items
      [role-slug]/     ← One sub-dir per role (e.g., sales-executive/, pre-sales/, etc.)
  features/
    leads/             ← Lead list, detail, follow-ups, call history UI
    inventory/         ← Project/unit browser UI
    brokers/           ← Broker management UI
    approvals/         ← Approval request UI
  components/
    analytics/         ← Recharts-based chart components
    chat/              ← ChatWidget (Socket.IO driven)
    commissions/       ← Commission display components
    dashboard/         ← Dashboard card/widget components
    leads/             ← Lead-specific shared components
    notifications/     ← NotificationBell component
    payments/          ← Payment display components
    ui/                ← Primitive UI elements
  lib/
    auth-client.ts     ← Better Auth client (createAuthClient)
    utils.ts           ← Shared utility functions
  middleware.ts        ← Route protection (cookie check only)
```

---

## Scripts

Run from `frontend/`:

```bash
pnpm dev        # Next.js dev server (port 3000)
pnpm build      # production build
pnpm start      # serve production build
pnpm lint       # ESLint
```
