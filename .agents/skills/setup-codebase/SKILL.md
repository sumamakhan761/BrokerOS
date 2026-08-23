---
name: setup-codebase
description: Use when the user asks to "setup the codebase", "run locally", or "get started". Sets up the complete BrokerOS codebase locally without Docker.
---

This skill guides the agent to set up the entire BrokerOS project locally for the user. Execute these steps sequentially.

**Important Context**: Before you begin, or if you run into any setup issues, read the READMEs for deep context:
- `apps/api/README.md`
- `apps/web/README.md`
- `apps/mobile/README.md` (Crucial for Push Notifications and Expo configuration)

## 1. Prerequisite Check

First, verify the user's environment by running commands to check versions of:
- `node -v`
- `pnpm -v`
- `docker -v` (optional, for local Postgres)

If any critical tool is missing, guide the user to install it before proceeding.

## 2. Create Environments & Automate "Bot Work"

Users should not paste their private API keys into the chat. Instead, you will prepare the `.env` files for them so they can fill them in manually.

First, create the `.env` files. Try using the terminal to copy them (e.g., `cp .env.example .env` and `cp apps/api/.env.example apps/api/.env` or `Copy-Item` in PowerShell). If the terminal command fails, fall back to using `view_file` and `write_to_file` to read the `.env.example` files and create `.env` in the root folder, `apps/api/`, `apps/web/`, and `apps/mobile/`.

Next, automate the non-sensitive configuration:
1. **Generate Auth Secret**: Run a node script or powershell command to generate a secure 32-character random hex string and inject it into the **root `/.env`** as `BETTER_AUTH_SECRET`.
2. **Fetch Local IP**: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux), parse the IPv4 address, and automatically set `MOBILE_URL="exp://<LAN_IP>:8081"` in `apps/api/.env` and `EXPO_PUBLIC_API_URL="http://<LAN_IP>:3333"` in `apps/mobile/.env`.

**Completion criterion**: The root `/.env` and `apps/api/.env`, `apps/web/.env`, and `apps/mobile/.env` are created and the non-sensitive automated variables are injected.

## 3. Prompt User for Manual API Key Entry

Once the `.env` files are ready, send a single, conversational, and friendly message to the user. **Do NOT just copy-paste a list.** Act as a helpful guide:

1.  **Explain the goal**: Tell them you've created the `.env` files and automated the local configuration, but for security reasons, they must manually paste their private API keys.
2.  **Provide guided instructions**: Walk them through exactly what keys are needed and provide the links. For example, explicitly explain how to navigate the Google Cloud Console for the Maps SDK key, rather than just dropping a link.
3.  **The required keys**:
    - `DATABASE_URL` in the **root `/.env`** (Explain they can use a local Docker DB which you'll spin up, or a cloud DB like [NeonDB](https://neon.tech/)).
    - `BLOB_READ_WRITE_TOKEN` in the **root `/.env`** (From [Vercel Storage](https://vercel.com/storage/blob)).
    - `GROQ_API_KEY` in the **root `/.env`** (From [Groq Console](https://console.groq.com/keys)).
    - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/web/.env` (From [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
    - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/mobile/.env` (From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) -> Enable Maps SDK for Android -> Credentials).
    - Optional: Push Notifications (Refer them to `apps/mobile/README.md` if they want to set up Firebase/Expo notifications).
4.  **The Hand-off**: Ask them to reply with the word "done" when they have finished pasting all their keys.

**Completion criterion**: You have thoughtfully and conversationally explained the required keys with proper guidance, and the user has explicitly replied indicating they are done. **Do not proceed to step 4 until the user confirms.**

## 4. Install Dependencies

Once the user confirms the `.env` files are populated, run dependency installation using the monorepo root command:
- `pnpm install`

**Completion criterion**: `node_modules` exists in all workspaces and the command completes successfully.

## 5. Initialize Database

Based on the user's database preference (ask them to clarify if they didn't in step 3):
- **If Local Docker**: 
  1. Run `docker compose up postgres -d` in the root folder.
  2. **Wait for Health**: Wait a few seconds and run a verification command (e.g., checking `docker ps`) to ensure the Postgres container is healthy and ready to accept connections.
- **If Cloud DB (Neon, etc.)**: 
  1. Assume the user has injected it into the **root `/.env`**.

Once the database is reachable, execute database migrations using Turborepo or specific filter:
- `pnpm --filter @brokeros/prisma db:generate`
- `pnpm --filter @brokeros/prisma db:migrate`
- `pnpm --filter @brokeros/prisma db:seed`

**Completion criterion**: Prisma client is generated, tables exist, and seed data is populated without errors.

## 6. Start Services

Start all services on behalf of the user concurrently using separate background terminal commands (use `cd` before running the specific command, or use `pnpm --filter`):
- **API**: `cd apps/api; pnpm start:dev`
- **Web**: `cd apps/web; pnpm dev`
- **Mobile**: `cd apps/mobile; npx expo start` or `npx expo run:android`

**Critical Mobile Note for Windows**: The mobile app uses custom native code (Auto-Dialer). If building on Windows, ensure your terminal command includes the Java Home before running `npx expo run:android`:
`$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; npx expo run:android`

**Completion criterion**: The agent has successfully launched all three services in background terminal tasks.
