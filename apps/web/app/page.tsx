"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  Layers,
  Building2,
  PhoneCall,
  MapPin,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Briefcase,
  Lock,
  Compass,
  ArrowUpRight,
  Sparkles,
  Database,
  Radio,
  FileSpreadsheet,
} from "lucide-react";

/* ─── Easing Constants (Emil Kowalski precision motion) ──────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ─── Role Sandbox Scenarios ────────────────────────────────────────── */
type RoleScenario = {
  id: string;
  roleTitle: string;
  badge: string;
  badgeColor: string;
  headline: string;
  summary: string;
  statPrimary: { label: string; value: string; change: string };
  statSecondary: { label: string; value: string };
  mockUi: {
    title: string;
    tag: string;
    items: { label: string; value: string; highlight?: boolean; status?: "success" | "warning" | "info" }[];
    actionLabel: string;
    secondaryActionLabel?: string;
  };
};

const SCENARIOS: RoleScenario[] = [
  {
    id: "pre-sales",
    roleTitle: "Pre-Sales Executive",
    badge: "Lead Acceleration",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    headline: "High-velocity lead qualification with manager daily targets",
    summary:
      "Daily cold-call quota tracking, instant lead assignment from portal webhooks, and AI temperature scoring (HOT/WARM/COLD) to maximize sales pipeline velocity.",
    statPrimary: { label: "Daily Call Target", value: "42 / 50", change: "+84% achieved" },
    statSecondary: { label: "Lead Conversion Rate", value: "23.8%" },
    mockUi: {
      title: "Lead #LD-9024 — Rahul Sharma",
      tag: "HOT LEAD · AI SCORE 94",
      items: [
        { label: "Project Interest", value: "Skyline Imperial (3 BHK)" },
        { label: "Budget Range", value: "₹2.20 Cr – ₹2.50 Cr", highlight: true },
        { label: "Assigned Executive", value: "Priya V. (Pre-Sales)" },
        { label: "Follow-up Scheduled", value: "Today, 4:30 PM", status: "warning" },
        { label: "Lead Source", value: "Meta Ads · Instant Webhook" },
      ],
      actionLabel: "Log Call & Mark Site Visit",
      secondaryActionLabel: "Reassign Lead",
    },
  },
  {
    id: "sales",
    roleTitle: "Sales Manager",
    badge: "Direct Sales (isCpProject = false)",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
    headline: "GPS-verified site visits and governed price negotiations",
    summary:
      "Field selfie check-ins with geo-coordinates, real-time unit inventory locks, and formal discount negotiation approval flows before booking creation.",
    statPrimary: { label: "Site Visits This Week", value: "38", change: "+14% vs last week" },
    statSecondary: { label: "Inventory Reserved", value: "14 Units" },
    mockUi: {
      title: "Site Visit #SV-1048 — Tower B, Unit 1402",
      tag: "GPS VERIFIED · 19.0760° N, 72.8777° E",
      items: [
        { label: "Unit Configuration", value: "3 BHK Luxury (1,840 sq.ft)" },
        { label: "Base Price", value: "₹2,65,00,000" },
        { label: "Approved Discount", value: "₹4,50,000 (Sales Mgr Approved)", highlight: true },
        { label: "Verification Status", value: "GPS Coordinates & Selfie Matched", status: "success" },
        { label: "Customer State", value: "Ready for Booking Advance" },
      ],
      actionLabel: "Generate Booking Agreement",
      secondaryActionLabel: "View Unit Floorplan",
    },
  },
  {
    id: "channel-partner",
    roleTitle: "Sourcing Manager",
    badge: "CP Network (isCpProject = true)",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    headline: "Channel partner onboarding and tiered commission tracking",
    summary:
      "Separate external broker network operations with project assignments, automatic brokerage tier settlement calculations, and zero data leakage into internal sales.",
    statPrimary: { label: "Active CP Brokers", value: "184", change: "+12 new this month" },
    statSecondary: { label: "CP Sales Volume", value: "₹48.2 Cr" },
    mockUi: {
      title: "Broker: Apex Realty Partners (RERA #A519000)",
      tag: "TIER 1 PARTNER · 2.50% SLAB",
      items: [
        { label: "Project Assignment", value: "Grandview Estates (CP Dedicated)" },
        { label: "Latest Booking Value", value: "₹1,90,00,000 (Unit C-404)" },
        { label: "Commission Payable", value: "₹4,75,000 (2.50%)", highlight: true },
        { label: "Settlement Status", value: "Finance Verification Complete", status: "success" },
        { label: "Sourcing Manager", value: "Vikram Malhotra" },
      ],
      actionLabel: "Approve Brokerage Settlement",
      secondaryActionLabel: "View Broker Ledger",
    },
  },
  {
    id: "finance",
    roleTitle: "Finance & Post-Sales",
    badge: "Ledger & Settlements",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    headline: "Automated builder inbound commission and milestone releases",
    summary:
      "Track inbound commissions from builders, compute TDS and GST deductions, and manage multi-stage construction milestone collection disbursements.",
    statPrimary: { label: "Inbound Receivables", value: "₹3.84 Cr", change: "92% collected" },
    statSecondary: { label: "Broker Payouts Due", value: "₹28.5 L" },
    mockUi: {
      title: "Settlement Batch #SET-8821",
      tag: "INBOUND BUILDER INVOICE",
      items: [
        { label: "Builder Account", value: "Prestige Group Enterprises" },
        { label: "Milestone Stage", value: "Plinth Completion (Stage 2)" },
        { label: "Gross Commission", value: "₹14,50,000", highlight: true },
        { label: "TDS / GST Status", value: "18% GST Compliant · 5% TDS", status: "info" },
        { label: "Customer Account", value: "Converted to Active Customer" },
      ],
      actionLabel: "Mark Inbound Received",
      secondaryActionLabel: "Download Tax Invoice",
    },
  },
  {
    id: "director",
    roleTitle: "Director Suite",
    badge: "Executive Cockpit",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    headline: "Real-time executive oversight across 12 departments",
    summary:
      "Holistic revenue velocity, conversion bottlenecks, inventory absorption heatmaps, and executive approval escalations in a single view.",
    statPrimary: { label: "Quarterly Revenue", value: "₹148.5 Cr", change: "+31% YoY growth" },
    statSecondary: { label: "Total Units Sold", value: "118 Units" },
    mockUi: {
      title: "BrokerOS Executive Master Metrics",
      tag: "FULL ENTERPRISE SCOPE",
      items: [
        { label: "Internal Brokerage GMV", value: "₹96.2 Cr (65%)" },
        { label: "Channel Partner GMV", value: "₹52.3 Cr (35%)", highlight: true },
        { label: "Avg Sales Cycle", value: "14.2 Days (Pre-Sales to Booking)" },
        { label: "System Health", value: "80+ Guarded Endpoints · 100% RBAC", status: "success" },
        { label: "Active Team Members", value: "48 Users across 12 Roles" },
      ],
      actionLabel: "Export Board Presentation",
      secondaryActionLabel: "Audit Security Logs",
    },
  },
];

/* ─── Enterprise Features ────────────────────────────────────────────── */
const CORE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Strict RBAC",
    description:
      "Every API endpoint guarded with session-validated roles via Better Auth. Zero client-side role trust; all access verified server-side.",
    accent: "text-purple-600 bg-purple-50",
  },
  {
    icon: Compass,
    title: "Dual Business Line Isolation",
    description:
      "Internal sales (`isCpProject = false`) and external broker network (`isCpProject = true`) share one database with guaranteed data boundary isolation.",
    accent: "text-indigo-600 bg-indigo-50",
  },
  {
    icon: MapPin,
    title: "GPS-Verified Site Visits",
    description:
      "Live geo-coordinate capture with timestamped field selfie verification prevents phantom visits and validates sales executive activity.",
    accent: "text-sky-600 bg-sky-50",
  },
  {
    icon: DollarSign,
    title: "Automated Commission Engine",
    description:
      "End-to-end tracking of builder inbound commissions and tiered CP broker payouts with automated TDS/GST calculation.",
    accent: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Radio,
    title: "Socket.IO Real-Time Sync",
    description:
      "Instant push notifications, team chat, inventory lock alerts, and lead assignment updates without page reloads.",
    accent: "text-amber-600 bg-amber-50",
  },
  {
    icon: Database,
    title: "PostgreSQL & Prisma 7",
    description:
      "Robust relational architecture with atomic multi-model database transactions, soft deletes, and BullMQ async background workers.",
    accent: "text-rose-600 bg-rose-50",
  },
];

export default function LandingPage() {
  const [activeScenarioId, setActiveScenarioId] = useState("pre-sales");
  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative selection:bg-purple-100 selection:text-purple-900">
      {/* ── Ambient Architectural Lighting ─────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-200/35 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-200/25 blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-[130px]" />
        {/* Architectural Subtle Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 px-4 sm:px-8 pt-4">
        <div className="max-w-6xl mx-auto glass rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 text-decoration-none group">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-600)] flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                Broker<span className="text-[var(--brand-600)]">OS</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-[var(--brand-700)] border border-purple-200">
                Enterprise CRM
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[var(--text-secondary)]">
            <a href="#sandbox" className="hover:text-[var(--brand-600)] transition-colors">
              Role Sandbox
            </a>
            <a href="#pillars" className="hover:text-[var(--brand-600)] transition-colors">
              Architecture
            </a>
            <a href="#security" className="hover:text-[var(--brand-600)] transition-colors">
              Security & RBAC
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-sm hover:shadow-md transition-all active:scale-[0.96] press-effect"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          {/* Live System Pill */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-purple-200/80 shadow-xs mb-8 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-700)]"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Mission-Critical Real Estate Operating System</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE_OUT_EXPO }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.08] mb-6 text-balance"
          >
            The Operating System Built for{" "}
            <span>Every Real Estate Role.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT_EXPO }}
            className="text-base sm:text-lg text-[var(--text-tertiary)] font-normal max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
          >
            Twelve deeply-crafted departmental dashboards, strict multi-factor RBAC,
            GPS-verified site visits, and automated commission settlements — completely
            partitioning internal sales from external channel partner networks.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT_EXPO }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] shadow-lg shadow-purple-600/25 transition-all hover:shadow-xl hover:shadow-purple-600/30 active:scale-[0.96] press-effect"
            >
              <span>Access Your Workspace</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>

            <a
              href="#sandbox"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] bg-white border border-[var(--border-default)] hover:bg-slate-50 shadow-xs transition-all active:scale-[0.96] press-effect"
            >
              <span>Explore Role Sandbox</span>
              <Compass className="w-4 h-4 text-purple-600" />
            </a>
          </motion.div>
        </div>

        {/* ── Key Metrics Bento Strip ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT_EXPO }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--brand-600)] tabular-nums mb-1">
              12
            </div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Role Workspaces</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Pre-Sales to Director</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums mb-1">
              100%
            </div>
            <div className="text-xs font-bold text-[var(--text-primary)]">RBAC Guarded</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">No client-side elevation</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 tabular-nums mb-1">
              2 Worlds
            </div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Clean Partition</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Single isCpProject flag</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover-lift">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums mb-1">
              Real-Time
            </div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Socket.io Engine</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Live chat & alerts</div>
          </div>
        </motion.div>

        {/* ── Interactive Multi-Role Sandbox Showcase ────────────────── */}
        <section id="sandbox" className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-[var(--brand-600)]">
              Interactive Workspace Sandbox
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-2 mb-3">
              Experience the platform through each stakeholder's eyes
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
              Click through the roles below to see how BrokerOS adapts its workflows, data visibility,
              and actions for every department.
            </p>
          </div>

          {/* Role Tab Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {SCENARIOS.map((scenario) => {
              const isActive = scenario.id === activeScenarioId;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setActiveScenarioId(scenario.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.96] press-effect ${isActive
                      ? "bg-[var(--brand-600)] text-white shadow-md shadow-purple-600/20"
                      : "bg-white text-[var(--text-secondary)] border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {scenario.roleTitle}
                </button>
              );
            })}
          </div>

          {/* Sandbox Live Display Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScenario.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden max-w-4xl mx-auto"
            >
              {/* Card Header Bar */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${activeScenario.badgeColor}`}
                  >
                    {activeScenario.badge}
                  </span>
                  <span className="text-xs font-extrabold text-[var(--text-primary)]">
                    {activeScenario.roleTitle} Workspace
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-[var(--text-tertiary)]">
                  <div>
                    <span className="text-[var(--text-muted)]">{activeScenario.statPrimary.label}: </span>
                    <strong className="text-[var(--text-primary)] tabular-nums">
                      {activeScenario.statPrimary.value}
                    </strong>
                    <span className="text-emerald-600 font-bold ml-1">
                      ({activeScenario.statPrimary.change})
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body Grid */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Description */}
                <div className="md:col-span-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)] mb-3 leading-snug">
                      {activeScenario.headline}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed mb-6">
                      {activeScenario.summary}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                    <div className="text-[11px] font-bold text-[var(--brand-700)] uppercase tracking-wider mb-1">
                      Secondary Metric
                    </div>
                    <div className="text-xl font-extrabold text-[var(--text-primary)] tabular-nums">
                      {activeScenario.statSecondary.value}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">
                      {activeScenario.statSecondary.label}
                    </div>
                  </div>
                </div>

                {/* Right Interactive Mock UI Component */}
                <div className="md:col-span-7 bg-slate-50/80 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-4">
                      <div className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--brand-600)]" />
                        {activeScenario.mockUi.title}
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[var(--text-secondary)]">
                        {activeScenario.mockUi.tag}
                      </span>
                    </div>

                    <div className="space-y-2.5 mb-6">
                      {activeScenario.mockUi.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white border border-slate-100"
                        >
                          <span className="text-[var(--text-tertiary)] font-medium">{item.label}</span>
                          <span
                            className={`font-bold tabular-nums ${item.highlight
                                ? "text-[var(--brand-700)] bg-purple-50 px-1.5 py-0.5 rounded"
                                : item.status === "success"
                                  ? "text-emerald-700"
                                  : item.status === "warning"
                                    ? "text-amber-700"
                                    : "text-[var(--text-primary)]"
                              }`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--brand-600)] hover:bg-[var(--brand-700)] transition-all shadow-sm active:scale-[0.96] press-effect flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeScenario.mockUi.actionLabel}</span>
                    </button>
                    {activeScenario.mockUi.secondaryActionLabel && (
                      <button className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] bg-white border border-slate-200 hover:bg-slate-100 transition-all active:scale-[0.96] press-effect">
                        {activeScenario.mockUi.secondaryActionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Architecture Pillars Section ────────────────────────────── */}
        <section id="pillars" className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-[var(--brand-600)]">
              Enterprise Engineering
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-2 mb-3">
              Built on uncompromising technical standards
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)]">
              Designed from ground zero for maximum security, zero operational leakage, and seamless scalability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CORE_PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm hover-lift flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${pillar.accent}`}>
                      <Icon className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── The Two-World Partition Spotlight ───────────────────────── */}
        <section id="security" className="mt-28 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-md">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-purple-50 text-[var(--brand-700)] border border-purple-200">
              Core Architectural Invariant
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-4 mb-3">
              Two Complete Business Lines. One Clean Flag.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-tertiary)] leading-relaxed">
              BrokerOS runs both internal sales operations and external broker networks under one roof,
              strictly segregated by <code className="px-1.5 py-0.5 rounded bg-slate-100 text-purple-700 font-mono text-xs font-bold">Project.isCpProject</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* World 1: Internal Brokerage */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg">
                    Internal Sales
                  </span>
                  <code className="text-[11px] font-mono font-bold text-slate-500">isCpProject = false</code>
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">
                  Direct In-House Sales Team
                </h4>
                <ul className="space-y-2 text-xs text-[var(--text-tertiary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                    <span>Pre-Sales lead triage & daily manager quotas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                    <span>Sales Executive on-site GPS verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
                    <span>Customer handovers & inbound builder commissions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* World 2: Channel Partner */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg">
                    Channel Partner Network
                  </span>
                  <code className="text-[11px] font-mono font-bold text-slate-500">isCpProject = true</code>
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">
                  External Real Estate Broker Network
                </h4>
                <ul className="space-y-2 text-xs text-[var(--text-tertiary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Sourcing & Closing Manager broker allocations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Multi-tiered brokerage payout calculations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Zero data cross-leakage into direct sales inventory</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ready to Launch CTA Banner ──────────────────────────────── */}
        <section className="mt-28 text-center bg-gradient-to-br from-[var(--brand-700)] to-indigo-950 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Ready to streamline your entire brokerage?
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 mb-8 leading-relaxed">
              Experience the power of a bespoke real estate operating system engineered for scale,
              governance, and velocity.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-[var(--brand-900)] bg-white hover:bg-purple-50 shadow-xl transition-all active:scale-[0.96] press-effect"
            >
              <span>Access Your Portal</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Clean Enterprise Footer ─────────────────────────────────── */}
      <footer className="border-t border-slate-200/80 bg-white py-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <Building2 className="w-4 h-4 text-[var(--brand-600)]" />
            <span>BrokerOS · Enterprise Real Estate Operating System</span>
          </div>
          <div className="flex items-center gap-6">
            <span>NestJS 11 · Next.js 16 · Prisma 7 · Better Auth</span>
            <span>© {new Date().getFullYear()} All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
