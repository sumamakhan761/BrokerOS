---
name: codebase-tour
description: Acts as a relentless deep-dive tour guide for the codebase. Creates an exhaustive, detailed markdown artifact mapping business logic, roles, departments, and codebase structure using aggressive code search.
---

This skill turns the agent into a relentless, code-first tour guide for the BrokerOS CRM. The goal is to produce an exhaustive, deep-dive `.md` Artifact that maps the codebase in extreme detail.

You must fight **premature completion**. Do not act lazy or stop after reading a high-level README. You must perform exhaustive **legwork** to explore the active codebase.

Follow these steps in strict sequence:

## 1. Map the Human Layer

First, understand exactly who uses the system.
Use `view_file` to read `docs/role-password.md`.
**Completion Criterion**: You have exhaustively mapped every single department, every single role, and which people/passwords belong to them. Do not proceed until you understand the complete human hierarchy.

## 2. Gather Ground Truth Context

Read the foundational rules, but do not stop here.
- Read `AGENTS.md` and `README.md` at the project root.
- Read the subtree rules: `apps/api/AGENTS.md`, `apps/web/AGENTS.md`, `apps/mobile/AGENTS.md`.
**Completion Criterion**: You understand the core business logic (e.g., the strict separation of Brokerage vs Channel Partner, the `isCpProject` flag, the marketing suite — Email, SMS, Voice).

## 3. Examine the Data Layer

- Open `packages/prisma/schema.prisma`. Locate every model related to the feature, department, or flow requested by the user.
- Open `packages/prisma/seed.ts`. Trace exactly how those models are populated with initial data.
**Completion Criterion**: You have traced every relational link, enum, and boolean flag for the requested domain.

## 4. Explore the Shared Packages

- `packages/types/src/` — Shared TypeScript interfaces. Domain sub-modules: `common.ts`, `email.ts`, `sms.ts`, `voice/` (telephony, agent, options, webhook, analytics, streaming).
- `packages/constants/src/` — Shared constants and pure logic. Domain sub-modules: `campaign.ts`, `email.ts`, `sms.ts`, `voice/` (telephony, agents, voices, scripts, pricing, normalizer).
- `packages/validators/src/` — Shared Zod schemas.
- `packages/storage/src/` — Vercel Blob wrappers.
**Completion Criterion**: You understand what lives in each package and can explain where shared types/constants come from.

## 5. Explore the Integrations Layer

- Read `integrations/README.md` for an overview.
- Explore `integrations/voice/` — understand the 8 AI voice agent adapters (`vapi`, `retell`, `sarvam`, `bolna`, `elevenlabs`, `livekit`, `openai-realtime`, `pipecat`) and the 4 PSTN carrier adapters in `integrations/voice/bridge/carrier-bridge-dispatcher.ts`.
- Explore `integrations/mail/` — 4 email provider adapters (`sendgrid`, `brevo`, `mailchimp`, `aws-ses`).
- Explore `integrations/sms/` — 4 SMS gateway adapters (`twilio`, `gupshup`, `sinch`, `aws-sns`).
**Completion Criterion**: You can explain how external API calls are routed through integration adapters and never called directly from NestJS services.

## 6. Relentless Code Search

This is where you must do the heavy **legwork**. Do not guess folder names based on `AGENTS.md`. You must aggressively explore the codebase.
- Use `list_dir` and `grep_search` repeatedly to explore `apps/api/src/`, `apps/web/app/`, `apps/web/features/marketing/`, `apps/mobile/app/`, `apps/workers/src/`, and `packages/`.
- For the marketing module specifically, trace the exact flow: frontend wizard step → API controller → service → BullMQ job → worker processor → integration adapter → external provider.
- Trace the exact `.ts` and `.tsx` files that implement the logic.
**Completion Criterion**: You have successfully found the absolute file paths for the backend controllers/services, frontend UI pages, worker processors, and mobile screens.

## 7. Explore Tooling & Commands

Read the root `package.json` and the `package.json` of relevant apps/packages to understand how the monorepo is operated. Be sure to find commands for testing (`.spec` files in API, tests in web/mobile), script running, Prisma generation/migrations, and starting all apps (web, mobile, api, workers).
**Completion Criterion**: You have mapped out the Turborepo scripts, installation commands, database scripts, testing scripts, and dev server commands.

## 8. Produce the Tour Artifact

Do not output the tour in standard chat text. You MUST use the `write_to_file` tool to create a new markdown artifact named `<topic_name>_tour.md` in the artifact directory. You must provide `ArtifactMetadata` with `UserFacing: true`.

The artifact must be exhaustive and structured as follows:

### Required Sections

- **Departments & Roles**: Exhaustively list all departments and roles (from `role-password.md`). Map each role to its business line (Brokerage / CP / Both).

- **Database Architecture**: Explain the Prisma models, enums, and relations in extreme detail. Include file links to `schema.prisma`. Highlight key models: Lead, Booking, Unit, BrokerageRecord, MarketingCampaign, VoiceAgentIntegration, EmailIntegration, SmsIntegration.

- **Shared Packages Architecture**: Explain what each `packages/` package provides, with its domain sub-module structure. Note which modules in `@brokeros/types` and `@brokeros/constants` cover email, SMS, and voice domains.

- **Integrations Architecture**: Explain the `integrations/` layer — which AI voice agents are supported, how the PSTN carrier bridge works, what email and SMS providers are available.

- **Commands & Tooling**: Provide all essential monorepo commands:
  - Starting the servers (web, mobile, api, workers).
  - Running tests (how to run spec files in api, web, mobile).
  - Running utility scripts (e.g., /script files, syncing).
  - Database commands (Prisma generate, migrate, seed).
  - Marketing-specific build verification (`pnpm --filter @brokeros/web exec next build`).

- **Codebase Structure & Flow**: Provide a granular, step-by-step breakdown of how the code executes for each major feature. You **MUST include at least 15 clickable `file:///` links** to specific `.ts` and `.tsx` implementation files. Cover:
  - A complete lead management flow (lead created → AI transcription → scoring → follow-up)
  - A complete marketing voice campaign flow (wizard → API → BullMQ worker → carrier bridge → AI agent)
  - A complete booking flow (lead → negotiation → booking → unit SOLD)
  - The auth + RBAC pattern (session → role guard → controller)

- **Marketing Suite Deep Dive**: A dedicated section covering:
  - Email campaign wizard steps (4) and their corresponding API endpoints
  - SMS campaign wizard steps (4) and their corresponding API endpoints
  - Voice campaign wizard steps (5) with special attention to VoiceStep4AgentComposer and its 6 studio subcomponents in `components/composer/`
  - How `normalizeVoiceLeadVariables` from `@brokeros/constants` bridges CRM lead data to AI script merge tags
  - How `tryCarrierBridgeDispatch` from `@brokeros/int-voice` dispatches actual phone calls

**Completion Criterion**: The artifact is successfully written to disk, is exhaustively detailed, contains at least 15 clickable file links to actual code, covers all major business flows including the full marketing suite, and you have responded to the user pointing them to the new artifact.
