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

### Quick Start with Docker

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env and frontend/.env with your values
# (See backend/README.md and frontend/README.md for exact requirements)

# Start everything
docker compose up --build

# Once running, open a new terminal to seed the database with demo users:
docker exec -it crm-backend npx prisma db seed
# 🔑 View all demo users & passwords created: docs/role-password.md
```

### Manual Setup

If you're working on a specific subtree, you only need to set up that part:

**Backend:**
```bash
cd backend
pnpm install
cp .env.example .env          # Edit with your values
pnpm db:generate
pnpm db:migrate
pnpm db:seed                  # Populate database with sample data (🔑 View credentials: docs/role-password.md)
pnpm start:dev                # → http://localhost:3333
```

**Frontend:**
```bash
cd frontend
pnpm install
cp .env.example .env          # Edit with your values
pnpm dev                      # → http://localhost:3000
```

**Mobile (Android Only):**
```bash
cd mobile
pnpm install
cp .env.example .env          # Set EXPO_PUBLIC_API_URL to your LAN IP

# Do NOT use Expo Go. You must compile the custom native client:
npx expo run:android
```

See the [Backend README](backend/README.md), [Frontend README](frontend/README.md), and [Mobile README](mobile/README.md) for detailed setup instructions.

---

## Project Structure

```
BrokerOS/
├── backend/       NestJS 11 API + Socket.IO (TypeScript ESM)
├── frontend/      Next.js 16 App Router web dashboard
├── mobile/        Expo 54 React Native Android app
└── docs/          Project documentation
```

Each subtree is independent — it has its own `package.json`, `.env.example`, and README. You can work on one without setting up the others.

---

## Pull Request Process

1. **Ensure your code works:**
   - Backend: `pnpm test` passes
   - Frontend: `pnpm build` succeeds, `pnpm lint` passes
   - Mobile: `npm run lint` passes

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
docs(backend): update API endpoint documentation
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

Use the subtree or module name: `backend`, `frontend`, `mobile`, `leads`, `inventory`, `brokers`, `auth`, `dashboard`, `docs`

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

