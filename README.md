<div align="center">

# 🏢 BrokerOS

**Open-source CRM built for real estate brokerages and channel partner networks.**

BrokerOS helps real estate teams manage their complete sales cycle in one system: lead capture from online ads, multi-channel outreach through AI voice calls, WhatsApp, email, and SMS, lead tracking, inventory, site visits, bookings, and post-sales workflows across web and mobile apps.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?logo=nestjs)](apps/api/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=next.js)](apps/web/)
[![Expo](https://img.shields.io/badge/Mobile-Expo%2054-4630EB?logo=expo)](apps/mobile/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## Why This Exists

Most real estate CRMs are built as generic sales databases or simple contact lists. BrokerOS is designed around the way real estate brokerages operate in practice, supporting two separate business models in a single platform:

- **Brokerage**: Your in-house sales team handles customer leads, schedules site visits, and closes property sales for developer projects.
- **Channel Partner (CP)**: Your team manages an external network of real estate brokers, handles on-site visits, and tracks multi-tier commission payouts.

## ✨ Features

### Marketing & Omnichannel Outreach

- **Lead Ad Capture & Performance Tracking (Meta, Instagram, Google & YouTube)**: Ingest leads in real time through verified webhooks from Meta, Instagram ads, Google Ads (Search and Performance Max), and YouTube ads. Incoming leads are automatically matched to existing records or created as new CRM prospects with full campaign, ad creative, and form attribution. Track marketing spend, cost per lead (CPL), conversions, view metrics, and impressions across Meta, Instagram, Google, and YouTube in a unified ads dashboard.
- **WhatsApp Business & Team Inbox**: A full WhatsApp Business Cloud API workspace integrated with the CRM. It includes a shared multi-agent inbox for real-time customer conversations, conversation assignment (manual or round-robin), custom contact tags, quick replies, and deal pipelines. You can build interactive chatbot flows with buttons and lists, set up keyword and status-triggered automations, send template broadcasts, and enable AI-assisted draft replies or automated answers with human agent handoff.
- **AI Voice Calling**: Run outbound voice outreach using AI voice agents connected to telephony carriers (such as Twilio, Exotel, Vobiz, Telnyx, etc). You can write custom conversation prompts with dynamic lead variables (such as prospect name and project details), test voice personas with in-browser audio previews, verify telephony lines with test calls, and track call outcomes and conversion funnels.
- **Email Campaigns**: Create, schedule, and send targeted email campaigns to filtered lead segments or uploaded contact lists. Includes a rich HTML template editor with merge tags, deliverability through connected email providers (SendGrid, Brevo, Mailchimp, AWS SES, etc), open and click tracking, test email sending, and the ability to convert CSV contacts into CRM leads when they engage.
- **SMS Campaigns**: Compose and schedule personalized SMS messages with live phone mockup previews and merge tags. Messages can include shortened links with click tracking to measure prospect interest, dispatched through SMS gateways like Twilio, Gupshup, Sinch, AWS SNS, etc.
- **Campaign Analytics**: Track delivery, open rates, link clicks, call connections, and conversion funnels across all communication channels in unified performance dashboards.
- **Background Worker Processing**: All outbound broadcasts, automations, and scheduled campaigns run as background queue jobs using BullMQ, keeping the interface fast and reliable during high-volume sends.

### Lead Management & AI

- **Lead Ingestion & Assignment**: Capture leads automatically from digital ads, CSV file uploads, or manual entry. Leads can be assigned directly to sales executives or distributed automatically across active team members using round-robin routing.
- **Direct Communication**: Initiate phone calls, launch WhatsApp conversations, schedule follow-ups, and coordinate on-site visits directly from the lead profile.
- **AI Call Transcription & Insights**: Automatically transcribes call recordings, generates clear conversation summaries, and extracts prospect requirements such as budget and preferred locations without overwriting existing manual entries.
- **Lead Scoring & Temperature**: Prioritize prospects by interaction quality and interest level (Hot, Warm, or Cold), helping sales agents focus their attention on high-intent buyers.
- **AI Next-Step Recommendations**: Recommends the next best follow-up action based on recent call summaries and activity logs, with one-click automated stage progression.
- **Activity Timeline**: A complete chronological timeline of every customer touchpoint, including call recordings, notes, scheduled visits, and stage transitions.

### Team Management, HR & Analytics

- **Daily Targets & Workload Balancing**: Managers can configure daily calling targets for teams or individual executives, reassign leads on demand, and adjust project responsibilities.
- **Backlog & Follow-Up Tracking**: Incomplete calls and missed follow-ups carry over into an executive's daily backlog, ensuring prospect inquiries are not lost.
- **Attendance & Announcements**: Built-in daily attendance tracking (check-in and check-out) and announcement boards to share updates across sales teams.
- **Goals & Team Recognition**: Set monthly performance targets for calls, scheduled visits, bookings, and closed revenue, with leaderboard recognition for top performers.
- **Performance Dashboards**: Tailored views for executives, managers, and leadership showing conversion rates, daily activity logs, and team progress.

### Mobile App & Auto-Dialer

- **Sequential Auto-Dialer**: A native Android auto-dialer built into the mobile app, allowing pre-sales agents to work through daily lead queues without manual dialing.
- **Automatic Call Sync**: Records call connections, durations, and logs directly to the CRM in the background.
- **Milestone Celebrations**: In-app recognition and achievement alerts when team members reach calling volume and performance milestones.

### Inventory & Projects

- **Property Hierarchy**: Organize real estate inventory across Developers, Projects, Towers, Floors, and Units for residential, commercial, and mixed-use developments.
- **Unit Availability & History**: Monitor unit statuses in real time (Available, Blocked, Reserved, and Sold). Booking a unit locks it to prevent duplicate sales and links it directly to the customer's record.
- **Pricing & Payment Milestones**: Manage versioned price sheets, construction-linked payment plans, and promotional offers.
- **AI Structure Setup**: Quickly set up towers, floors, unit layouts, base prices, and commission rates using natural language prompts.

### GPS-Verified Site Visits

- **Authentic Visit Verification**: Sales executives verify on-site customer visits by capturing live GPS coordinates and a photo at the project location, ensuring visits are genuine.
- **Scheduling & Map View**: Coordinate prospect site visits directly from the lead profile, assign executives, and track visit locations on an interactive map.

### Bookings & Post-Sales

- **Structured Sales Pipeline**: Track converted sales smoothly through document collection, home loan processing, agreement registration, and final possession handover.
- **Payment Schedules & Collections**: Generate milestone-based payment schedules linked to construction progress, record customer transactions, and track outstanding collections with automated reminders.
- **Inbound Developer Commissions**: Track builder-side commissions owed to the brokerage firm for completed property sales.

### Channel Partner (CP) Operations

- **Dedicated Partner Network**: Completely separate external broker operations from direct brokerage sales with strict project and lead scoping.
- **Sourcing Management**: Onboard real estate brokers, verify KYC and RERA registrations, log GPS-verified field meetings with selfie check-ins, and manage broker performance pipelines.
- **Closing Management**: Stationed at project sites to welcome broker-referred prospects, manage on-site negotiations, and coordinate bookings through to possession.
- **Commission Locking & Settlements**: Set flat or percentage-based commission rates per project, with structured verification and approval workflows for payouts and receipt records.
- **AI Broker Copilot**: Analyzes recent interactions with external brokers, suggests relationship milestones, and generates professional meeting notes.

### Approvals & Financial Workflows

- **Ticket-Based Approvals**: Request manager and finance approvals for price discounts, payment timeline adjustments, and refunds.
- **In-Ticket Chat Threads**: Discuss and resolve approval requests directly inside each ticket with managers and finance teams.
- **Financial Controls**: Multi-level review workflows for major financial decisions, commission payouts, and expense tracking.

### Team Communication & Security

- **Role-Based Internal Chat**: Real-time team messaging allowing sales executives and managers to coordinate quickly within role boundaries.
- **Live Notifications**: Instant updates in the web dashboard paired with mobile push notifications for urgent tasks, lead handoffs, and approval updates.
- **Document Management**: Secure cloud storage for property brochures, RERA certificates, customer KYC files, and payment receipts.

### Role-Based Workspaces & Dashboards

Each role has a dedicated dashboard with KPIs, operational tools, and permissions matching their responsibilities:

| Role | Business Line | Focus Area |
| --- | --- | --- |
| Admin | Both | User administration, permissions, and system settings |
| Director | Brokerage | Overall brokerage revenue, conversion metrics, and project sales |
| Business Manager | Both | Cross-business operations, team performance, and resource allocation |
| Marketing Manager | Both | Ad platform connections, multi-channel outreach, and lead attribution |
| Pre-Sales Manager | Brokerage | Daily call targets, backlog tracking, lead assignment, and team stats |
| Pre-Sales Executive | Brokerage | Daily lead queues, auto-dialer calling, follow-ups, and activity logs |
| Sales Manager | Brokerage | Sales pipeline velocity, site visit completions, and discount approvals |
| Sales Executive | Brokerage | Prospect follow-ups, GPS site visits, negotiations, and bookings |
| Post-Sales Manager | Brokerage | Collection tracking, loan cases, registration status, and handovers |
| Post-Sales Executive | Brokerage | Payment milestones, bank disbursement tracking, and customer handovers |
| Channel Partner | CP | CP project portfolios, broker sales, and payout summaries |
| Sourcing Manager | CP | Broker onboarding, field visits, RERA/KYC verification, and commissions |
| Closing Manager | CP | On-site walk-ins, broker-referred bookings, and payment schedules |
| Finance | Both | Commission verification, expense approvals, invoices, and payouts |

## 🏗️ Architecture

```
BrokerOS/
├── apps/
│   ├── api/          NestJS 11 REST API + Socket.IO
│   │   └── src/
│   │       ├── auth/           Better Auth + role-based access control
│   │       ├── leads/          Lead lifecycle, follow-ups, calls, site visits, bookings
│   │       ├── inventory/      Projects, towers, floors, units, documents
│   │       ├── brokers/        CP broker onboarding, field visits, settlements
│   │       ├── approvals/      Ticket-based approval workflows
│   │       ├── chat/           Real-time team chat (Socket.IO)
│   │       ├── notifications/  In-app alerts + mobile push notifications
│   │       ├── dashboard/      Role-tailored analytics and performance services
│   │       ├── marketing/      Omnichannel marketing and communication
│   │       │   ├── whatsapp/   Inbox, chatbot flows, automations, pipelines, broadcasts
│   │       │   ├── voice/      AI voice campaigns, carrier bridge, prompt editor
│   │       │   ├── email/      Email campaigns, templates, tracking, webhooks
│   │       │   ├── sms/        SMS campaigns, short-link tracking, gateways
│   │       │   └── ads/        Meta, Instagram, Google, and YouTube lead webhooks
│   │       └── lib/            Prisma ORM, auth configuration, cloud storage
│   │
│   ├── web/          Next.js 16 (App Router) web dashboard
│   │   ├── app/
│   │   │   ├── login/          Authentication screen
│   │   │   └── dashboard/      Role-based shell with dedicated workspace views
│   │   │       └── marketing/  WhatsApp, voice, email, SMS, and ads workspaces
│   │   ├── features/           Domain UI components (leads, inventory, marketing)
│   │   ├── components/         Shared UI primitives, charts, chat, notifications
│   │   └── lib/                Auth client, API utilities
│   │
│   ├── mobile/       Expo 54 (React Native) Android app
│   │   ├── app/
│   │   │   ├── (auth)/         Mobile login screen
│   │   │   └── (dashboard)/    Tab navigation with role-specific mobile screens
│   │   ├── modules/
│   │   │   └── auto-dialer/    Native Android auto-dialer module
│   │   └── lib/                Auth client, socket context, GPS location tracking
│   │
│   └── workers/      BullMQ asynchronous background processors
│       └── src/processors/
│           ├── marketing-email.processor.ts
│           ├── marketing-sms.processor.ts
│           ├── marketing-voice.processor.ts
│           └── marketing-whatsapp.processor.ts
│
├── packages/
│   ├── prisma/       Prisma ORM schema, migrations, and database client (@brokeros/prisma)
│   ├── storage/      Vercel Blob cloud storage helpers (@brokeros/storage)
│   ├── types/        Shared TypeScript interfaces and DTOs (@brokeros/types)
│   ├── validators/   Shared Zod validation schemas (@brokeros/validators)
│   └── constants/    Shared constants, enums, and normalizers (@brokeros/constants)
│
├── integrations/
│   ├── voice/        AI voice platform adapters and PSTN carrier bridge (@brokeros/int-voice)
│   ├── mail/         Email provider adapters (SendGrid, Brevo, Mailchimp, AWS SES)
│   ├── sms/          SMS gateway adapters (Twilio, Gupshup, Sinch, AWS SNS)
│   ├── whatsapp/     Meta WhatsApp Cloud API client (@brokeros/int-whatsapp)
│   └── ads/          Lead form webhook ingest adapters for Meta, Instagram, Google, and YouTube
│
└── docker-compose.yml      PostgreSQL + API + Web setup
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Backend** | NestJS 11 · TypeScript · Prisma 7 · PostgreSQL |
| **Frontend** | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Recharts · Framer Motion |
| **Mobile** | Expo 54 · Expo Router 6 · React Native · NativeWind |
| **Auth** | Better Auth (web, mobile, and API) |
| **Real-time** | Socket.IO 4 |
| **Async Jobs** | BullMQ (background campaign processors) |
| **File Storage** | Vercel Blob |
| **Push Notifications** | Expo Push SDK |
| **AI Processing** | Groq & LLM completions (call transcription, lead insights, tower generation) |
| **AI Voice & Telephony** | Voice agent platforms (Vapi, Retell, Sarvam, Bolna, ElevenLabs, etc.) bridged to carriers (Twilio, Exotel, Vobiz, Telnyx) |
| **Email Providers** | SendGrid · Brevo · Mailchimp · AWS SES |
| **SMS Gateways** | Twilio · Gupshup · Sinch · AWS SNS |
| **WhatsApp** | Meta WhatsApp Cloud API (`@brokeros/int-whatsapp`) |
| **Ad Platforms & Lead Ingest** | Meta, Instagram, Google Ads & YouTube lead form webhooks (`@brokeros/int-ads-*`) |
| **Maps** | Google Maps (web and mobile location verification) |
| **Containerization** | Docker & Docker Compose |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 22
- **pnpm** ≥ 10
- **PostgreSQL** 16+ (or use Docker)
- **Android Studio** (for mobile development only)

---

### Step 1: Clone & Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/sumamakhan761/BrokerOS.git
cd BrokerOS

# 2. Install dependencies via pnpm workspace
pnpm install

# 3. Copy the environment files for the root and the apps
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

**Split Environment Architecture**
We separate `.env` files to prevent backend secrets from leaking to the frontend.

- **Root `/.env`**: Core infrastructure keys (DB, Auth, AI, Storage, telephony/voice keys). You **must** configure this.
- **App `.env`s**: Local routing URLs and client-specific keys (like Google Maps).

**How to get these values?**

#### A. Authentication (`BETTER_AUTH_SECRET`)

Better Auth requires a strong, randomly generated 32-character secret to sign sessions.
Run this command in your terminal to generate one:

```bash
openssl rand -hex 32
```

Set in `.env`:
`BETTER_AUTH_SECRET="your-generated-hash-here"`
`BETTER_AUTH_URL="http://localhost:3333"` _(Keep this default for local dev)_

#### B. External Cloud Services

- **Vercel Blob (File Uploads)**: Go to [Vercel Storage](https://vercel.com/storage/blob) to get your token.
  `BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"`
- **Groq (AI Call Processing)**: Go to [Groq Console](https://console.groq.com/keys) to get a free API key.
  `GROQ_API_KEY="gsk_your_key_here"`

For deep-dive instructions on how to run, test, and build each individual piece of the stack, check their dedicated readmes:

- 🟢 **[Backend API Guide](apps/api/README.md)**
- 🔵 **[Frontend Web Guide](apps/web/README.md)**
- 📱 **[Mobile App Guide](apps/mobile/README.md)**
- ⚡ **[Background Workers Guide](apps/workers/README.md)**
- 🔗 **[Integrations Guide](integrations/README.md)**

---

### 🤖 AI Agent Setup

If you are using the **AI IDE / CLI**, you don't need to manually run the setup commands. Simply use the built-in AI skills:

1. Type **`/setup-codebase`** in the agent chat. The AI will automatically create your `.env` files, install all dependencies, start the database, and launch all services.
2. Type **`/codebase-tour`** after setup to have the AI generate an exhaustive, customized markdown map of the codebase and its business logic.

---

### Option A: Docker Setup

The fastest way to get the web platform running. This starts PostgreSQL, the NestJS API, and the Next.js Web App.

```bash
# Optional: Clean reset if previous containers/volumes exist
docker compose down -v --remove-orphans

# Build and start the web platform and database
docker compose up --build

# Note: The backend container automatically deploys migrations and populates
# demo users & projects on first run (--if-empty flag).
# To manually re-seed at any time:
docker exec -it crm-backend pnpm db:seed
# 🔑 View all demo users & passwords created: docs/role-password.md

# Open in your browser:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:3333
```

> **Mobile App:** Docker does not run the mobile app. To run the mobile app alongside Docker, follow the manual Mobile steps in Option B below.

---

### Option B: Manual Setup

All development commands should be executed from the **monorepo root**:

#### 1. Backend (API) & Database Setup

```bash
# Generate, migrate, and seed the database
pnpm db:generate             # Generate Prisma client
pnpm db:migrate              # Run pending migrations
pnpm db:seed                 # Populate database with sample data (🔑 View credentials: docs/role-password.md)

# Start the API server (from root)
pnpm dev:api                 # Start dev server → http://localhost:3333
```

#### 2. Frontend (Web)

```bash
# Start the Next.js web dashboard (from root)
pnpm dev:web                 # Start dev server → http://localhost:3000
```

#### 3. Mobile (Android Only)

```bash
# Set EXPO_PUBLIC_API_URL in apps/mobile/.env to your machine's LAN IP before starting!
pnpm dev:mobile              # Start Metro bundler (press 'a' to run on Android)
# OR to compile and run natively on Android emulator/device:
cd apps/mobile
npx expo run:android
```

> For detailed instructions on setting up an Android emulator, connecting a physical device, and configuring Google Services for push notifications, read the **[Mobile README](apps/mobile/README.md)**.

---

## 📖 Documentation

| Document | Description |
| --- | --- |
| [Backend README](apps/api/README.md) | Backend architecture, API modules (leads, inventory, marketing), database, development guide |
| [Frontend README](apps/web/README.md) | Frontend architecture, role-based routing, marketing campaign tools, components, development guide |
| [Background Workers Guide](apps/workers/README.md) | BullMQ asynchronous job processors for Email, SMS, Voice, and WhatsApp campaigns |
| [Integrations Guide](integrations/README.md) | Voice agent adapters, PSTN carrier bridge, email & SMS provider adapters |
| [Contributing Guide](CONTRIBUTING.md) | How to contribute to the project |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Security Policy](SECURITY.md) | Reporting vulnerabilities |
| [Changelog](CHANGELOG.md) | Release history |
| [License](LICENSE) | MIT License |

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

---

## 🔒 Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md) for responsible disclosure. **Do not open a public issue for security vulnerabilities.**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License · Copyright (c) 2026 Sumama Khan
```

---

<div align="center">

**Built with ❤️ for the real estate industry**

[⬆ Back to top](#-BrokerOS)

</div>
