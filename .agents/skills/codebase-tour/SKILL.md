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
**Completion Criterion**: You understand the core business logic (e.g., the strict separation of Brokerage vs Channel Partner).

## 3. Examine the Data Layer

- Open `packages/prisma/schema.prisma`. Locate every model related to the feature, department, or flow requested by the user.
- Open `packages/prisma/seed.ts`. Trace exactly how those models are populated with initial data.
**Completion Criterion**: You have traced every relational link, enum, and boolean flag for the requested domain.

## 4. Relentless Code Search

This is where you must do the heavy **legwork**. Do not guess folder names based on `AGENTS.md`. You must aggressively explore the codebase.
- Use `list_dir` and `grep_search` repeatedly to explore `apps/api/src/`, `apps/web/app/`, `apps/mobile/app/`, and `packages/`.
- Trace the exact `.ts` and `.tsx` files that implement the logic. 
**Completion Criterion**: You have successfully found the absolute file paths for the backend controllers/services, frontend UI pages, and mobile screens.

## 5. Explore Tooling & Commands

Read the root `package.json` and the `package.json` of relevant apps/packages to understand how the monorepo is operated. Be sure to find commands for testing (`.spec` files in API, tests in web/mobile), script running, Prisma generation/migrations, and starting all apps (web, mobile, api).
**Completion Criterion**: You have mapped out the Turborepo scripts, installation commands, database scripts, testing scripts, and dev server commands.

## 6. Produce the Tour Artifact

Do not output the tour in standard chat text. You MUST use the `write_to_file` tool to create a new markdown artifact named `<topic_name>_tour.md` in the artifact directory. You must provide `ArtifactMetadata` with `UserFacing: true`.

The artifact must be exhaustive and structured as follows:
- **Departments & Roles**: Exhaustively list all departments and roles involved (derived from `role-password.md`).
- **Database Architecture**: Explain the Prisma models, enums, and relations in extreme detail. Include file links to `schema.prisma`.
- **Commands & Tooling**: Provide all essential monorepo commands (you can hardcode these or dynamically extract them). Must include:
  - Starting the servers (web, mobile, api).
  - Running tests (how to run spec files in api, web, mobile).
  - Running utility scripts (e.g., /script files, syncing).
  - Database commands (Prisma generate, migrate, seed).
- **Codebase Structure & Flow**: Provide a granular, step-by-step breakdown of how the code executes. You **MUST include at least 10 clickable `file:///` links** to specific `.ts` and `.tsx` implementation files. 

**Completion Criterion**: The artifact is successfully written to disk, is exhaustively detailed, contains at least 10 clickable file links to actual code, and you have responded to the user pointing them to the new artifact.
