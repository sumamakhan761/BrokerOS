# AGENTS.md — apps/web/

---
**Tailwind v4 note:** This project uses Tailwind CSS v4, NOT v3. The config format, plugin API, and some utility names differ. Check `postcss.config.mjs` and `app/globals.css` before writing any Tailwind classes.

---

## Directory Structure

```
apps/web/
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

## Skills

You **MUST** consult the appropriate skill before making changes, based on the task you are doing:

- **General UI & Components**: If you are asked to build or modify UI, read:
  `.agents/skills/better-ui/SKILL.md`
- **Interface & UX Design**: For high-level interface design and component composition, read:
  `.agents/skills/better-interface/SKILL.md`
- **Layouts & Spacing**: When structuring page layouts or modifying grid/flex structures, read:
  `.agents/skills/better-layout/SKILL.md`
- **Colors & Theming**: When applying colors or modifying the theme, read:
  `.agents/skills/better-colors/SKILL.md`
- **Typography**: When working with fonts, text sizes, or text styling, read:
  `.agents/skills/better-typography/SKILL.md`
- **Accessibility (a11y)**: When ensuring components are accessible (ARIA, screen readers, keyboard navigation), read:
  `.agents/skills/better-accessibility/SKILL.md`
- **Shadcn UI**: When adding or modifying `shadcn/ui` components, read:
  `.agents/skills/shadcn/SKILL.md`
- **Frontend Testing**: When writing or updating tests for the frontend, read:
  `.agents/skills/write-frontend-tests/SKILL.md`

---

## Scripts

Run from `apps/web/` directory (or use `pnpm --filter @brokeros/web <cmd>` from root):

```bash
pnpm dev        # Next.js dev server (port 3000)
pnpm build      # production build
pnpm start      # serve production build
pnpm lint       # ESLint
```
