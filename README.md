<div align="center">

# 🏢 BrokerOS

**The open-source, AI-powered CRM built for real estate brokerages.**

Manage your entire brokerage and channel partner operation — agentic call processing, leads, inventory, bookings, commissions, post-sales, finance — from one platform with web and mobile apps.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2011-E0234E?logo=nestjs)](backend/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=next.js)](frontend/)
[![Expo](https://img.shields.io/badge/Mobile-Expo%2054-4630EB?logo=expo)](mobile/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## Why This Exists

Most real estate CRMs are either overpriced SaaS tools or half-baked spreadsheets. BrokerOS is a **production-grade, self-hostable CRM** purpose-built for the way real estate brokerages actually work — with two distinct business lines under one roof:

- **Brokerage** — Your internal sales team sells properties to clients.
- **Channel Partner (CP)** — You manage an external broker network that brings leads to builder projects.

Same database. Same inventory. Separated by one flag: `isCpProject`. No data leaks between the two worlds.

---

## ✨ Features

### Lead Management & AI
- **AI-Powered Call Processing**: Integrates with AI via a background `p-queue` to automatically transcribe calls, summarize intent, and extract budget/location requirements.
- **Smart Lead Scoring**: AI categorizes leads as HOT, WARM, NOT_INTERESTED, or BUSY based on call transcripts, assigning a 0-100 score.
- **AI Auto-Scheduling**: If the AI detects a need for a follow-up, it automatically creates a `FollowUp` record in the database with the exact date, title, and reason.
- **Non-Destructive Field Extraction**: The AI extracts data (like budget or preferred location) and intelligently updates the Lead profile *only* if those fields are currently empty, preserving manual data.
- **Omnichannel Communication**: Trigger phone calls natively, send WhatsApp template messages, schedule site visits, and log meetings directly from the Lead Profile dashboard.
- **360° Activity Timeline**: A complete, immutable audit trail of every interaction, note created, status change, and document upload associated with a lead.
- **Lead Distribution**: Built-in rules engine supporting Round Robin, Manual, and Project-wise assignment with capacity caps.

### Manager Operations, HR & Analytics
- **Dynamic Task Engine**: Managers can set dynamic daily cold-call targets (`ManagerTask`) which automatically cascade to the executives' dashboards, with manual overrides for specific users.
- **Resource Assignment**: Managers can assign leads directly to executives, assign specific projects to teams, and adjust workloads on the fly.
- **Automated Backlog Tracking**: The system strictly tracks uncompleted calls (`coldCallBacklogIn`) and missed follow-ups (`missedFollowUpIds`). Managers can change tasks and backlogs to ensure zero lead leakage.
- **Employee HR & Attendance**: Built-in `Attendance` tracking (Check-in/Check-out) natively inside the CRM, with `Announcement` broadcasting for managers to push updates to their teams.
- **Gamified Targets & Recognition**: Set monthly revenue/booking targets (`EmployeeTarget`) and issue digital awards (`EmployeeRecognition`) that display on leaderboards.
- **Performance Analytics**: 12 role-specific cached dashboards providing real-time visibility into team conversion ratios, daily performance logs, and monthly leaderboards.

### Android Native Auto-Dialer & Gamification
- **Custom Native Module**: Built directly into the Expo app (`AutoDialerModule.kt`) using Android's `TelephonyManager` and `PhoneStateListener`.
- **Sequential Cold Calling**: Pre-sales executives can blast through daily call targets without manual dialing.
- **Background Sync**: Uses `CallUploadWorker` to sync call durations and logs back to the NestJS backend automatically.
- **Gamified Call Milestones**: The system tracks executive performance and triggers real-time celebration notifications (`ACHIEVEMENT_MILSTONE`) when hitting milestones like 1,000 or 10,000 connected calls.

### Inventory & Projects
- **Deep Hierarchy**: Builders → Projects → Towers → Floors → Units. Supports Residential, Commercial, and Mixed project types.
- **Project Management**: Managers can assign specific employees to handle inventory and set up possession milestones (construction progress tracking).
- **AI Tower Generation**: Use natural language prompts to automatically generate entire physical real estate structures (towers, floors, units, prices, and commission percentages) via Groq, safely committed in a single database transaction.
- **Unit Lifecycle & Audit Trails**: Granular unit status tracking (AVAILABLE → BLOCKED → RESERVED → SOLD) backed by `UnitStatusHistory`. Once a unit is sold, it displays the complete information and important details of the converted lead.
- **Dynamic Pricing**: Versioned `PriceSheet` models, `PaymentPlanTemplate` milestones, and time-bound `Offer` management.

### GPS-Verified Site Visits
- **Location Tracking**: Built-in `LiveTrackingMap` using `react-native-maps` and `expo-location`.
- **Fraud Prevention**: Site visits require `SiteVisitVerification` capturing the executive's GPS coordinates and accuracy.

### Bookings & Post-Sales
- **State-Driven Pipeline**: Booking progress (CONFIRMED → HANDOVER) is intelligently derived from the existence of sub-entities (`LoanCase`, `Agreement`, `PossessionHandover`) rather than manual status toggles.
- **Payment & Collection Tracking**: Post-Sales teams track customer payment milestones, partial payments, and auto-generated payment schedules (`PaymentTransaction`, `CollectionRecord`).
- **Loan & Agreement Tracking**: Track bank disbursements, stamp duty, and registration fees.
- **Inbound Commissions**: Post-Sales tracks commissions owed *to* the brokerage *from* external builders upon successful property sales (`InboundCommission`).

### Channel Partner (CP) Operations
- **3-Tier Hierarchy**: Channel Partner (Boss) → Sourcing Manager (Manages brokers & payouts) → Closing Manager (Handles CP bookings & lead payments).
- **Sourcing Manager Duties**: Responsible for recruiting external brokers, logging GPS-verified field meetings (selfie + coordinates required), managing the broker pipeline, and executing **Broker Commissions** (processing `BrokerageRecord` and uploading payment receipts).
- **Closing Manager Duties**: Stationed at the project site. Responsible for handling walk-in CP leads, creating on-site **Bookings** to **Handover**, and managing the customer's **Payment Schedules and Transactions**.
- **Broker AI Assistant**: Automatically analyzes recent interactions with external brokers and suggests pipeline transitions (NEW → CONTACTED → VISIT → DEAL), generating professional transition notes.
- **Commission Locking**: `BrokerProjectAssignment` locks in flat or percentage-based commissions for external agents once a deal is struck.
- **Brokerage Settlements**: Sourcing Managers and Finance use a 2-step approval workflow to verify and pay external agents securely.

### Approvals & Finance
- **Ticket-Based Approvals**: Employees can create approval requests (e.g., for discounts or refunds) and send them to their managers or the finance team. 
- **Collaboration**: Features chat-style threads inside `ApprovalRequest` so employees can talk directly with managers and finance to coordinate and resolve the request quickly.
- **Formal Financial Approvals**: 2-level hierarchical approvals (`FinancialApproval`) for strict expense tracking and final sign-offs.

### Platform Core & Communications
- **Real-Time Role-Based Chat**: Integrated Socket.IO chat allows employees to talk directly to their managers and coordinate with team members, with strict hierarchical access control.
- **Dual-Layer Notifications**: Instant WebSocket updates for the web dashboard bell icon, paired with Expo Server SDK for native mobile push notifications.
- **Secure File Storage**: Deep integration with Vercel Blob for managing RERA documents, KYC files, and chat attachments.

### 12 Role-Based Dashboards
Every role gets a dedicated dashboard with relevant KPIs, charts, and action items:

| Role | Business Line | What They See |
|---|---|---|
| Admin | Both | Full system overview, user management |
| Director | Brokerage | Top-level brokerage metrics |
| Business Manager | Both | Cross-business oversight |
| Pre-Sales Manager | Brokerage | Team targets, daily performance, call stats |
| Pre-Sales | Brokerage | Personal call targets, follow-up queue, auto-dialer |
| Sales Executive | Brokerage | Lead pipeline, site visits, negotiations, bookings |
| Sales Manager | Brokerage | Team performance, discount approvals |
| Post-Sales | Brokerage | Loan tracker, agreements, possession pipeline |
| Channel Partner | CP | All CP projects, broker performance |
| Sourcing Manager | CP | Broker recruitment, onboarding pipeline |
| Closing Manager | CP | On-site bookings for broker leads |
| Finance | Both | Commissions, expenses, invoices, settlements |


## 🏗️ Architecture

```
BrokerOS/
├── apps/
│   ├── api/          NestJS 11 REST API + Socket.IO
│   │   ├── src/
│   │   │   ├── auth/           Better Auth + RBAC guards
│   │   │   ├── leads/          Leads, follow-ups, calls, notes, site visits, bookings
│   │   │   ├── inventory/      Projects, towers, floors, units, documents
│   │   │   ├── brokers/        Broker CRUD, meetings, referrals, settlements
│   │   │   ├── approvals/      Approval workflows
│   │   │   ├── chat/           Real-time chat (Socket.IO)
│   │   │   ├── notifications/  Push + in-app notifications
│   │   │   ├── dashboard/      12 role-specific analytics services
│   │   │   └── lib/            Prisma, auth config, storage helpers
│   │   └── prisma/             Schema (74 models, 43 enums) + migrations
│   │
│   ├── web/          Next.js 16 (App Router) web dashboard
│   │   ├── app/
│   │   │   ├── login/          Public login page
│   │   │   └── dashboard/      Role-based shell + 12 role sub-routes
│   │   ├── features/           Domain feature UI (leads, inventory, brokers, approvals)
│   │   ├── components/         Shared UI, charts, chat widget, notifications
│   │   └── lib/                Auth client, utilities
│   │
│   ├── mobile/       Expo 54 (React Native) Android app
│   │   ├── app/
│   │   │   ├── (auth)/         Login / signup screens
│   │   │   └── (dashboard)/    Tab navigator + 14 role screen directories
│   │   ├── modules/
│   │   │   └── auto-dialer/    Custom native Android module (local package)
│   │   └── lib/                Auth client, socket context, GPS tracking
│   │
│   └── workers/      BullMQ async background processors (Coming soon)
│
├── packages/
│   ├── types/        Shared TS interfaces (@brokeros/types)
│   ├── validators/   Shared Zod schemas (@brokeros/validators)
│   └── constants/    Shared constants and pure logic (@brokeros/constants)
│
└── docker-compose.yml      PostgreSQL + API + Web (one command)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | NestJS 11 · TypeScript · Prisma 7 · PostgreSQL |
| **Frontend** | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Recharts · Framer Motion |
| **Mobile** | Expo 54 · Expo Router 6 · React Native · NativeWind |
| **Auth** | Better Auth (all platforms) |
| **Real-time** | Socket.IO 4 |
| **File Storage** | Vercel Blob |
| **Push Notifications** | Expo Push SDK |
| **AI** | Groq (call transcription) |
| **Maps** | Google Maps (web + mobile) |
| **Containerization** | Docker + Docker Compose |

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

# 3. Copy the environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

> **IMPORTANT:** You must configure these `.env` files before running the project. For detailed environment setup, refer to the comments inside each `.env` file and the respective subtree READMEs ([Backend](apps/api/README.md), [Frontend](apps/web/README.md), [Mobile](apps/mobile/README.md)).

---

### 🤖 AI Agent Setup

If you are using the **AI IDE / CLII**, you don't need to manually run the setup commands. Simply use the built-in AI skills:

1. Type **`/setup-codebase`** in the agent chat. The AI will automatically create your `.env` files, install all dependencies, start the database, and launch all services.
2. Type **`/codebase-tour`** after setup to have the AI generate an exhaustive, customized markdown map of the codebase and its business logic.

---

### Option B: Docker Setup

The fastest way to get the web platform running manually. This starts PostgreSQL, the NestJS API, and the Next.js Web App.

```bash
# Start the web platform and database
docker compose up --build

# Once running, open a new terminal to seed the database with demo users:
docker exec -it crm-backend npx prisma db seed
# 🔑 View all demo users & passwords created: docs/role-password.md

# Open in your browser:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:3333
```

> **Mobile App:** Docker does not run the mobile app. To run the mobile app alongside Docker, follow the manual Mobile steps in Option C below.

---

### Option C: Manual Setup

Run each service individually for full development control. Ensure you have a PostgreSQL database running and configured in `apps/api/.env` and `apps/api/README.md`.

#### 1. Backend (API)
```bash
cd apps/api
pnpm db:generate            # Generate Prisma client
pnpm db:migrate             # Run pending migrations
pnpm db:seed                # Populate database with sample data (🔑 View credentials: docs/role-password.md)
pnpm start:dev              # Start dev server → http://localhost:3333
```

#### 2. Frontend (Web)
```bash
cd apps/web
pnpm dev                    # Start dev server → http://localhost:3000
```

#### 3. Mobile (Android Only)
```bash
cd apps/mobile
# Set EXPO_PUBLIC_API_URL in apps/mobile/.env to your machine's LAN IP before starting!

npx expo start              # Start Metro bundler (press 'a' to run on Android)
# OR
npx expo run:android        # Build natively and run on emulator/device
```
> For detailed instructions on setting up an Android emulator, connecting a physical device, and configuring Google Services for push notifications, read the **[Mobile README](apps/mobile/README.md)**.

---

### Prisma Studio

To inspect your database visually:
```bash
cd backend
pnpm db:studio              # Open visual database browser → http://localhost:5555
```

---

## 📖 Documentation

| Document | Description |
|---|---|
| [Backend README](backend/README.md) | Backend architecture, API modules, database, development guide |
| [Frontend README](frontend/README.md) | Frontend architecture, routing, components, development guide |
| [Mobile README](mobile/README.md) | Mobile architecture, native modules, Android setup |
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

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License · Copyright (c) 2026 Sumama Khan
```

---

<div align="center">

**Built with ❤️ for the real estate industry**

[⬆ Back to top](#-BrokerOS)

</div>
