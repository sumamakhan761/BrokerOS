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

If you are using the **AI IDE / CLII**, you can skip running commands manually. Use the built-in agent skills:

- Type **`/setup-codebase`** in the chat to have the AI automatically install dependencies, copy `.env` files, run migrations, and start all services.
- Type **`/codebase-tour`** to have the AI generate a deep-dive, customized architectural map of the system to help you understand where to make your PR changes.

### Quick Start with Docker

```bash
# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit apps/api/.env and apps/web/.env with your values
# (See apps/api/README.md and apps/web/README.md for exact requirements)

# Start everything
docker compose up --build

# Once running, open a new terminal to seed the database with demo users:
docker exec -it crm-backend npx prisma db seed
# 🔑 View all demo users & passwords created: docs/role-password.md
```

### Manual Setup

If you're working locally without Docker, follow these steps. With Turborepo and pnpm workspaces, you can install everything from the root!

**1. Install all dependencies (Run at root):**
```bash
pnpm install
```

**2. Backend (API):**
```bash
cd apps/api
cp .env.example .env          # Edit with your values
pnpm db:generate
pnpm db:migrate
pnpm db:seed                  # Populate database with sample data (🔑 View credentials: docs/role-password.md)
pnpm start:dev                # → http://localhost:3333
```

**3. Frontend (Web):**
```bash
cd apps/web
cp .env.example .env          # Edit with your values
pnpm dev                      # → http://localhost:3000
```

**4. Mobile (Android Only):**
```bash
cd apps/mobile
cp .env.example .env          # Set EXPO_PUBLIC_API_URL to your LAN IP

# Do NOT use Expo Go. You must compile the custom native client:
npx expo run:android
```

See the [Backend README](apps/api/README.md), [Frontend README](apps/web/README.md), and [Mobile README](apps/mobile/README.md) for detailed setup instructions.

---

## Project Structure

```
BrokerOS/
├── apps/
│   ├── api/       NestJS 11 API + Socket.IO (TypeScript ESM)
│   ├── web/       Next.js 16 App Router web dashboard
│   ├── mobile/    Expo 54 React Native Android app
│   └── workers/   BullMQ async background processors
├── packages/
│   ├── types/       Shared TS interfaces (@brokeros/types)
│   ├── validators/  Shared Zod schemas (@brokeros/validators)
│   └── constants/   Shared logic and constants (@brokeros/constants)
└── docs/          Project documentation
```

This is a **pnpm monorepo** managed by Turborepo. You can run commands globally via `pnpm --filter <package_name> <command>`, or work within specific subtrees.

---

## Pull Request Process

1. **Ensure your code works:**
   - Run type checks and linters from the root: `pnpm lint` and `pnpm build`
   - Test backend specifically: `pnpm --filter @brokeros/api test`

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

Use the app/package or module name: `api`, `web`, `mobile`, `workers`, `types`, `validators`, `constants`, `leads`, `inventory`, `brokers`, `auth`, `dashboard`, `docs`

### Examples

```
feat(leads): add lead temperature auto-scoring based on activity
fix(frontend): sidebar not collapsing on mobile viewport
docs(mobile): add auto-dialer troubleshooting section
chore(backend): upgrade NestJS to 11.2
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

---

## Security Vulnerabilities

**Do not open public issues for security vulnerabilities.** Please follow our [Security Policy](SECURITY.md) for responsible disclosure.

---

## Questions?

If you have questions about contributing, open a [Discussion](https://github.com/sumamakhan761/BrokerOS/discussions) on GitHub.

