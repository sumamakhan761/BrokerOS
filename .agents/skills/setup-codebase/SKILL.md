---
name: setup-codebase
description: Use when the user asks to "setup the codebase", "run locally", or "get started". Sets up the complete BrokerOS codebase locally without Docker.
---

This skill guides the agent to set up the entire BrokerOS project locally for the user. Execute these steps sequentially.

**Important Context**: Before you begin, or if you run into any setup issues, read the READMEs for deep context:
- `apps/api/README.md`
- `apps/web/README.md`
- `apps/mobile/README.md` (Crucial for Push Notifications and Expo configuration)
- `integrations/README.md` (For marketing channel integrations)

---

## 1. Prerequisite Check

First, verify the user's environment by running commands to check versions of:
- `node -v`
- `pnpm -v`
- `docker -v` (optional, for local Postgres)

If any critical tool is missing, guide the user to install it before proceeding.

---

## 2. Create Environments & Automate "Bot Work"

Users should not paste their private API keys into the chat. Instead, you will prepare the `.env` files for them so they can fill them in manually.

First, create the `.env` files. Try using the terminal to copy them (e.g., `cp .env.example .env` and `cp apps/api/.env.example apps/api/.env` or `Copy-Item` in PowerShell). If the terminal command fails, fall back to using `view_file` and `write_to_file` to read the `.env.example` files and create `.env` in the root folder, `apps/api/`, `apps/web/`, and `apps/mobile/`.

Next, automate the non-sensitive configuration:
1. **Generate Auth Secret**: Run a node script or powershell command to generate a secure 32-character random hex string and inject it into the **root `/.env`** as `BETTER_AUTH_SECRET`.
2. **Fetch Local IP**: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux), parse the IPv4 address, and automatically set `MOBILE_URL="exp://<LAN_IP>:8081"` in `apps/api/.env` and `EXPO_PUBLIC_API_URL="http://<LAN_IP>:3333"` in `apps/mobile/.env`.

**Completion criterion**: The root `/.env` and `apps/api/.env`, `apps/web/.env`, and `apps/mobile/.env` are created and the non-sensitive automated variables are injected.

---

## 3. Prompt User for Core API Keys

Once the `.env` files are ready, send a single, conversational, and friendly message to the user. **Do NOT just copy-paste a list.** Act as a helpful guide:

1. **Explain the goal**: Tell them you've created the `.env` files and automated the local configuration, but for security reasons, they must manually paste their private API keys.
2. **Walk them through the required core keys** (these are always needed):
   - `DATABASE_URL` in the **root `/.env`** (They can use a local Docker DB which you'll spin up, or a cloud DB like [NeonDB](https://neon.tech/))
   - `BLOB_READ_WRITE_TOKEN` in the **root `/.env`** (From [Vercel Storage](https://vercel.com/storage/blob))
   - `GROQ_API_KEY` in the **root `/.env`** (From [Groq Console](https://console.groq.com/keys) — free tier available)
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/web/.env` (From [Google Cloud Console](https://console.cloud.google.com/apis/credentials))
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `apps/mobile/.env` (Same Google key, enable Maps SDK for Android)
   - Optional: Push Notifications (Refer them to `apps/mobile/README.md` if they want Firebase/Expo notifications)
3. **Ask them to reply with "done"** when they have finished pasting the core keys.

**Completion criterion**: User has explicitly replied indicating they are done with core keys. **Do not proceed to step 4 until the user confirms.**

---

## 4. Install Dependencies

Once the user confirms the `.env` files are populated, run dependency installation using the monorepo root command:
- `pnpm install`

**Completion criterion**: `node_modules` exists in all workspaces and the command completes successfully.

---

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

---

## 6. Start Core Services

Start the core services (API + Web) as background terminal tasks:
- **API**: `pnpm --filter @brokeros/api start:dev` → http://localhost:3333
- **Web**: `pnpm --filter @brokeros/web dev` → http://localhost:3000
- **Mobile** (if they want it): `cd apps/mobile; npx expo start` or `npx expo run:android`

**Critical Mobile Note for Windows**: The mobile app uses custom native code (Auto-Dialer). If building on Windows, ensure your terminal command includes the Java Home before running `npx expo run:android`:
`$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; npx expo run:android`

**Completion criterion**: API and Web services are running. Confirm both are reachable before moving on.

---

## 7. Optional Setup — Workers (BullMQ / Redis)

After the core CRM is running, ask the user:

> **"Do you want to use the Marketing Campaign Workers (Email, SMS, and AI Voice broadcast)? If yes, you'll need a Redis connection for the BullMQ job queue."**

If they say **yes**:

1. **Set up Redis** — guide them to one of these options:
   - **Upstash Redis** (recommended, free tier): Go to [Upstash Console](https://console.upstash.com/), create a Redis database, copy the **Redis CLI TLS URL** and set it in the **root `/.env`**:
     ```
     REDIS_URL="redis://default:<password>@<host>.upstash.io:6379"
     ```
   - **Local Redis via Docker**: Run `docker run -d -p 6379:6379 redis:alpine` and set `REDIS_URL="redis://127.0.0.1:6379"`
   - **Railway / Render Redis**: Copy the connection string from their dashboard.

2. **If they need a public URL for AI voice webhooks** (Vapi, Retell, etc. call back to your server), they also need `API_PUBLIC_URL` in the root `.env`:
   - For local dev, use [ngrok](https://ngrok.com/): `ngrok http 3333` → copy the HTTPS URL
   - Set: `API_PUBLIC_URL="https://xxxx.ngrok-free.app"`

3. **Start the Workers service**:
   ```bash
   pnpm --filter @brokeros/workers start:dev
   ```

If they say **no**: skip this section entirely.

---

## 8. Optional Setup — AI Voice TTS/STT Keys

After the core setup, ask the user:

> **"Do you plan to use the AI Voice Campaign feature? If yes, add the TTS/STT provider keys you want to use in the root `.env`."**

All keys are **optional** — add only the providers you plan to use. Email providers, SMS gateways, and PSTN telephony carriers are all configured **inside the web app** at runtime — no `.env` needed for those.

Add the relevant keys to the **root `/.env`**:

```env
# ElevenLabs — Conversational AI + TTS
# Get key: https://elevenlabs.io/ → Profile → API Keys
ELEVENLABS_API_KEY=""

# Deepgram — Speech-to-Text transcription
# Get key: https://console.deepgram.com/ → API Keys
DEEPGRAM_API_KEY=""

# Cartesia — High quality neural TTS
# Get key: https://cartesia.ai/ → Dashboard → API Keys
CARTESIA_API_KEY=""

# Sarvam AI — Indic language neural TTS + voice calls
# Get key: https://dashboard.sarvam.ai/ → API Keys
SARVAM_API_KEY=""

# Inworld AI — Conversational AI characters
# Get key: https://studio.inworld.ai/ → Workspace → API Keys
INWORLD_API_KEY=""

# MiniMax — Multilingual neural TTS
# Get key: https://www.minimax.io/ → Console → API Keys
MINIMAX_API_KEY=

# Fish Audio — Voice cloning TTS
# Get key: https://fish.audio/ → Dashboard → API Keys
FISH_AUDIO_API_KEY=
```

If they say **no** to Voice: skip this step entirely.

---

## 9. Final Health Check & Summary

After all services are started, do a final verification:

1. Hit `http://localhost:3333` — should return `{"status":"ok"}` or NestJS response.
2. Hit `http://localhost:3000` — should load the BrokerOS login page.
3. If workers are running, confirm the BullMQ connection logged successfully.

Then give the user a friendly **setup complete** summary listing:
- Which services are running and on which ports
- Reminder that email/SMS/PSTN carriers are connected **inside the web app** under Marketing → Settings — no `.env` needed for those
- Credentials file: `docs/role-password.md` — all seeded demo user logins are here
- Next steps: suggest running `/codebase-tour` to explore the full system
