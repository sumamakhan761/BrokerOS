# Contributing to BrokerOS

Thank you for your interest in contributing! This guide will help you get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Commit Messages](#commit-messages)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/BrokerOS.git
   cd BrokerOS
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feat/your-feature-name
   ```

---

## Development Setup

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10
- PostgreSQL 16+ (or Docker)
- Android Studio (for mobile work only)

### 🤖 AI Agent Setup 

If you are using the **AI IDE / CLI**, you can skip running commands manually. Use the built-in agent skills:

- Type **`/setup-codebase`** in the chat to have the AI automatically install dependencies, copy `.env` files, run migrations, and start all services.
- Type **`/codebase-tour`** to have the AI generate a deep-dive, customized architectural map of the system to help you understand where to make your PR changes.

### Quick Start with Docker

```bash
# Copy all environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Note: The root /.env file is the most important one!
# Edit it with your Database URL, Better Auth secret, etc.
# apps/web/.env and apps/api/.env are mostly pre-filled with local URLs.

# Start everything
docker compose up --build

# Once running, open a new terminal to seed the database with demo users:
docker exec -it crm-backend pnpm db:seed
# 🔑 View all demo users & passwords created: docs/role-password.md
```

### Manual Setup

If you're working locally without Docker, follow these steps. With Turborepo and pnpm workspaces, you can install everything from the root!

**1. Install all dependencies & set up environment variables (Run at root):**
```bash
pnpm install

# Copy all required environment templates
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env

# IMPORTANT: 
# 1. Edit the root /.env file with your Database URL, Auth secret, Groq API key, etc.
# 2. Edit apps/mobile/.env and set EXPO_PUBLIC_API_URL to your machine's LAN IP address.
# 3. For apps/web and apps/api, the defaults are usually fine for local development.
```

**2. Backend (API) & Database Setup:**
```bash
# Generate and seed the database using Prisma (run from root)
pnpm db:generate
pnpm db:migrate
pnpm db:seed                 # Populate database with sample data (🔑 View credentials: docs/role-password.md)

# Start the API server (run from root)
pnpm dev:api                 # → http://localhost:3333
```

**3. Frontend (Web):**
```bash
# Start the Next.js web dashboard (run from root)
pnpm dev:web                 # → http://localhost:3000
```

**4. Mobile (Android Only):**
```bash
# Start Metro bundler (run from root)
pnpm dev:mobile
# Or compile and run custom native client:
cd apps/mobile && npx expo run:android
```

> 💡 **Where do I get the API keys?** 
> 
> **Authentication (`BETTER_AUTH_SECRET`)**
> Better Auth requires a strong, randomly generated 32-character secret to sign sessions.
> Run this command in your terminal to generate one:
> `openssl rand -hex 32`
> Set in `.env`: `BETTER_AUTH_SECRET="your-generated-hash-here"`
> 
> **Vercel Blob (File Uploads)**
> Go to [Vercel Storage](https://vercel.com/storage/blob) to get your token.
> Set in `.env`: `BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"`
> 
> **Groq (AI Call Processing)**
> Go to [Groq Console](https://console.groq.com/keys) to get a free API key.
> Set in `.env`: `GROQ_API_KEY="gsk_your_key_here"`
> 
> **Want to run tests or build a specific app?** Check their dedicated readmes:
> - 🟢 **[Backend API Guide](apps/api/README.md)**
> - 🔵 **[Frontend Web Guide](apps/web/README.md)**
> - 📱 **[Mobile App Guide](apps/mobile/README.md)**
> - 🔗 **[Integrations Guide](integrations/README.md)**

---

## Project Structure

```
BrokerOS/
├── apps/
│   ├── api/       NestJS 11 API + Socket.IO (TypeScript ESM)
│   │              Modules: auth, leads, inventory, brokers, approvals,
│   │              chat, notifications, dashboard, marketing (email/sms/voice)
│   ├── web/       Next.js 16 App Router web dashboard
│   │              Features: leads, inventory, brokers, approvals,
│   │              marketing (email/sms/voice campaign wizards)
│   ├── mobile/    Expo 54 React Native Android app
│   └── workers/   BullMQ async background processors
│                  (marketing-email, marketing-sms, marketing-voice processors)
├── packages/
│   ├── prisma/      Prisma ORM schema, migrations, and client (@brokeros/prisma)
│   ├── storage/     Vercel Blob storage wrappers (@brokeros/storage)
│   ├── types/       Shared TS interfaces with domain sub-modules (@brokeros/types)
│   ├── validators/  Shared Zod schemas (@brokeros/validators)
│   └── constants/   Shared logic and constants with domain sub-modules (@brokeros/constants)
├── integrations/
│   ├── voice/       @brokeros/int-voice — 8 AI voice agents + 4 PSTN carriers
│   ├── mail/        Email provider adapters (SendGrid, Brevo, Mailchimp, AWS SES)
│   └── sms/         SMS gateway adapters (Twilio, Gupshup, Sinch, AWS SNS)
└── docs/          Project documentation
```

This is a **pnpm monorepo** managed by Turborepo. You can run commands globally via `pnpm --filter <package_name> <command>`, or work within specific subtrees.

---

## Making Changes

### Key Conventions

1. **Always read the scoped `AGENTS.md`** before touching a subtree:
   - `apps/api/AGENTS.md` — for backend changes
   - `apps/web/AGENTS.md` — for frontend changes
   - `apps/mobile/AGENTS.md` — for mobile changes

2. **Shared constants/types** go in `packages/constants/` or `packages/types/`, not in app-level files. See `AGENTS.md` root for the migration policy.

3. **External API calls** must go through `integrations/` adapters, not directly in NestJS services.

4. **Database** — use Prisma only. No raw SQL. Multi-model writes use `$transaction`.

5. **Auth** — use Better Auth only. No custom JWT or session logic.

6. **Workers** — any heavy I/O (CSV parsing, external API blasting) must be enqueued to BullMQ, not done inline in the request cycle.

---

## Pull Request Process

1. **Ensure your code works:**
   - Run type checks and linters from the root: `pnpm lint` and `pnpm build`
   - Test backend specifically: `pnpm --filter @brokeros/api test`
   - Verify Next.js build: `pnpm --filter @brokeros/web exec next build`

2. **Write a clear PR description:**
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?
   - Screenshots for UI changes

3. **Keep PRs focused** — One logical change per PR

4. **Request review** from maintainers

### PR Title Format

Use a clear, descriptive title:

```
feat(leads): add bulk CSV import for leads
fix(auth): session not persisting after page refresh
docs(api): update API endpoint documentation
chore(deps): upgrade Prisma to 7.x
feat(marketing): add voice campaign retry logic
```

---

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons (no code change) |
| `refactor` | Code restructuring (no feature or fix) |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency updates |

### Scopes

Use the app/package or module name: `api`, `web`, `mobile`, `workers`, `types`, `validators`, `constants`, `integrations`, `leads`, `inventory`, `brokers`, `auth`, `dashboard`, `marketing`, `email`, `sms`, `voice`, `docs`

### Examples

```
feat(marketing): add 5-step voice campaign wizard
fix(voice): fix carrier bridge fallback on Vobiz timeout
refactor(api): decompose voice.service.ts into sub-services
feat(constants): add voice normalizer for lead merge tags
chore(workers): wire tryCarrierBridgeDispatch in marketing-voice processor
```

---

## Reporting Bugs

Open an issue with:

1. **Title:** Clear, concise description
2. **Environment:** OS, Node.js version, browser (if frontend)
3. **Steps to reproduce:** Numbered steps to trigger the bug
4. **Expected behavior:** What should happen
5. **Actual behavior:** What actually happens
6. **Screenshots/logs:** If applicable

---

## Suggesting Features

Open an issue with:

1. **Problem:** What problem does this solve?
2. **Proposed solution:** How should it work?
3. **Alternatives considered:** Other approaches you thought about
4. **Which role(s) benefit:** Which of the 12 roles would use this?
5. **Which business line:** Brokerage, Channel Partner, or both?
6. **Which channel (if marketing):** Email, SMS, or AI Voice?

---

## Security Vulnerabilities

**Do not open public issues for security vulnerabilities.** Please follow our [Security Policy](SECURITY.md) for responsible disclosure.

---

## Questions?

If you have questions about contributing, open a [Discussion](https://github.com/sumamakhan761/BrokerOS/discussions) on GitHub.
