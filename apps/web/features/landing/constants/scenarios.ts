import {
  ShieldCheck,
  Compass,
  MapPin,
  DollarSign,
  Radio,
  Database,
} from "lucide-react";

export type RoleScenario = {
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

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const SCENARIOS: RoleScenario[] = [
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

export const CORE_PILLARS = [
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
