# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - Initial Open Source Release

### Architecture (Monorepo)
- Migrated the codebase to a strict `pnpm` monorepo using Turborepo.
- Separated applications into `apps/api`, `apps/web`, `apps/mobile`, and `apps/workers`.
- Created shared package structure under `packages/` for `@brokeros/types`, `@brokeros/validators`, and `@brokeros/constants` to facilitate future extraction of shared domain logic.

### Added
- **Core CRM**: Built specifically for real estate brokerages with two distinct business lines (Brokerage and Channel Partner) managed under one platform.
- **Backend (NestJS 11)**:
  - 8 domain modules (leads, inventory, brokers, approvals, chat, notifications, dashboard, auth).
  - Robust PostgreSQL database schema with 74 models and 43 enums (Prisma 7).
  - Role-based access control (RBAC) supporting 12 distinct roles.
  - Better Auth integration for secure, cookie-based session management.
  - Vercel Blob integration for secure document storage.
  - Socket.IO gateway for real-time chat and notifications.
- **Frontend (Next.js 16)**:
  - 12 role-specific dashboards with customized views and features.
  - Comprehensive lead management interface (scoring, temperature, call logs, follow-ups).
  - Inventory browser for projects, towers, floors, and units.
  - Channel Partner management tools (broker onboarding, project assignments).
  - Real-time chat widget and notification bell.
  - Tailwind CSS v4 styling with HeroUI and Framer Motion.
- **Mobile (Expo 54 / React Native)**:
  - Android application optimized for field teams.
  - 14 role-specific screen layouts.
  - **Auto-Dialer**: Custom native Android module for sequential cold calling.
  - GPS-verified site visits with selfie capture.
  - Push notifications via Expo Push SDK.
- **Infrastructure**:
  - Multi-stage Dockerfiles for backend and frontend.
  - Unified `docker-compose.yml` for simplified local development and deployment.
- **Documentation**:
  - Comprehensive READMEs for the root project and all subtrees.
  - `CONTRIBUTING.md` guide for open-source contributors.
  - `CODE_OF_CONDUCT.md` based on Contributor Covenant v2.1.
  - `SECURITY.md` policy for responsible vulnerability disclosure.
