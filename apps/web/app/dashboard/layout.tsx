"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  Building2,
  Briefcase,
  ShieldCheck,
  DollarSign,
  Handshake,
  Users,
  TrendingUp,
  BarChart2,
  Star,
  List,
  CheckSquare,
  Calendar,
  Package,
  Settings,
  ChevronRight,
  Radio,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  ArrowLeft,
  Globe,
  Search,
  Video,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ChatWidget } from "@/components/chat/ChatWidget";

/* ─── Role color mapping (Perceptual OKLCH) ────────────────────────── */
const ROLE_CONFIG: Record<
  string,
  { accent: string; bg: string; border: string; label: string }
> = {
  PRE_SALES: {
    accent: "oklch(0.535 0.235 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Pre-Sales",
  },
  PRE_SALES_MANAGER: {
    accent: "oklch(0.455 0.215 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Pre-Sales Manager",
  },
  SALES_EXECUTIVE: {
    accent: "oklch(0.48 0.18 240)",
    bg: "oklch(0.965 0.035 240)",
    border: "oklch(0.88 0.06 240)",
    label: "Sales Executive",
  },
  SALES_MANAGER: {
    accent: "oklch(0.45 0.16 230)",
    bg: "oklch(0.965 0.035 230)",
    border: "oklch(0.88 0.06 230)",
    label: "Sales Manager",
  },
  POST_SALES: {
    accent: "oklch(0.42 0.16 145)",
    bg: "oklch(0.965 0.035 145)",
    border: "oklch(0.88 0.06 145)",
    label: "Post-Sales",
  },
  POST_SALES_MANAGER: {
    accent: "oklch(0.38 0.14 145)",
    bg: "oklch(0.965 0.035 145)",
    border: "oklch(0.88 0.06 145)",
    label: "Post-Sales Manager",
  },
  SOURCING_MANAGER: {
    accent: "oklch(0.50 0.17 80)",
    bg: "oklch(0.975 0.04 85)",
    border: "oklch(0.88 0.08 85)",
    label: "Sourcing Manager",
  },
  CLOSING_MANAGER: {
    accent: "oklch(0.46 0.20 25)",
    bg: "oklch(0.965 0.035 25)",
    border: "oklch(0.88 0.07 25)",
    label: "Closing Manager",
  },
  CHANNEL_PARTNER: {
    accent: "oklch(0.535 0.235 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Channel Partner",
  },
  FINANCE: {
    accent: "oklch(0.45 0.14 180)",
    bg: "oklch(0.965 0.035 180)",
    border: "oklch(0.88 0.06 180)",
    label: "Finance",
  },
  BUSINESS_MANAGER: {
    accent: "oklch(0.455 0.215 275)",
    bg: "oklch(0.975 0.015 275)",
    border: "oklch(0.895 0.075 275)",
    label: "Business Manager",
  },
  DIRECTOR: {
    accent: "oklch(0.38 0.18 260)",
    bg: "oklch(0.965 0.03 260)",
    border: "oklch(0.88 0.06 260)",
    label: "Director Suite",
  },
  ADMIN: {
    accent: "oklch(0.46 0.20 25)",
    bg: "oklch(0.965 0.035 25)",
    border: "oklch(0.88 0.07 25)",
    label: "Administrator",
  },
  MARKETING: {
    accent: "oklch(0.55 0.22 310)",
    bg: "oklch(0.975 0.02 310)",
    border: "oklch(0.895 0.07 310)",
    label: "Marketing Suite",
  },
};

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  const [roleCode, setRoleCode] = useState<string>("");
  const [fetchingRoles, setFetchingRoles] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const user = session?.user as any;
    if (user?.roleId) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";
      fetch(`${baseUrl}/roles`)
        .then((res) => res.json())
        .then((roles) => {
          if (Array.isArray(roles)) {
            const role = roles.find((r: any) => r.id === user.roleId);
            if (role) setRoleCode(role.code);
          }
        })
        .catch(console.error)
        .finally(() => setFetchingRoles(false));
    } else if (!isPending) {
      setFetchingRoles(false);
    }
  }, [session, isPending]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await authClient.signOut();
    router.push("/login");
  };

  /* ── Loading State ───────────────────────────────────────────────── */
  if (isPending || fetchingRoles) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-base)] gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-purple-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--brand-600)] animate-spin" />
        </div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] tracking-tight">
          Authenticating workspace…
        </p>
      </div>
    );
  }

  const userRole = roleCode || "UNKNOWN";
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG["PRE_SALES"];

  /* ── Nav Links Configuration ─────────────────────────────────────── */
  let navLinks = [
    { name: "Overview", href: "/dashboard/pre-sales", icon: LayoutDashboard, roles: ["*"] },
  ];

  if (userRole === "PRE_SALES") {
    navLinks = [
      { name: "Overview", href: "/dashboard/pre-sales", icon: LayoutDashboard, roles: ["PRE_SALES"] },
      { name: "Lead Management", href: "/dashboard/pre-sales/lead-management", icon: Users, roles: ["PRE_SALES"] },
      { name: "Analytics", href: "/dashboard/pre-sales/analytics", icon: BarChart2, roles: ["PRE_SALES"] },
      { name: "Settings", href: "/dashboard/pre-sales/settings", icon: Settings, roles: ["PRE_SALES"] },
    ];
  } else if (userRole === "PRE_SALES_MANAGER") {
    navLinks = [
      { name: "Overview", href: "/dashboard/pre-sales-manager", icon: LayoutDashboard, roles: ["PRE_SALES_MANAGER"] },
      { name: "Employees", href: "/dashboard/pre-sales-manager/employees", icon: Users, roles: ["PRE_SALES_MANAGER"] },
      { name: "New Leads", href: "/dashboard/pre-sales-manager/new-leads", icon: Star, roles: ["PRE_SALES_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/pre-sales-manager/lead-management", icon: List, roles: ["PRE_SALES_MANAGER"] },
      { name: "Marketing", href: "/dashboard/marketing", icon: Mail, roles: ["PRE_SALES_MANAGER"] },
      { name: "Analytics", href: "/dashboard/pre-sales-manager/analytics", icon: BarChart2, roles: ["PRE_SALES_MANAGER"] },
      { name: "Settings", href: "/dashboard/pre-sales-manager/settings", icon: Settings, roles: ["PRE_SALES_MANAGER"] },
    ];
  } else if (userRole === "SALES_EXECUTIVE") {
    navLinks = [
      { name: "Overview", href: "/dashboard/sales-executive", icon: LayoutDashboard, roles: ["SALES_EXECUTIVE"] },
      { name: "Lead Management", href: "/dashboard/sales-executive/lead-management", icon: Users, roles: ["SALES_EXECUTIVE"] },
      { name: "Approval", href: "/dashboard/sales-executive/approval", icon: CheckSquare, roles: ["SALES_EXECUTIVE"] },
      { name: "Booking", href: "/dashboard/sales-executive/booking", icon: Calendar, roles: ["SALES_EXECUTIVE"] },
      { name: "Inventory", href: "/dashboard/sales-executive/inventory", icon: Package, roles: ["SALES_EXECUTIVE"] },
      { name: "Analytics", href: "/dashboard/sales-executive/analytics", icon: BarChart2, roles: ["SALES_EXECUTIVE"] },
      { name: "Settings", href: "/dashboard/sales-executive/settings", icon: Settings, roles: ["SALES_EXECUTIVE"] },
    ];
  } else if (userRole === "SALES_MANAGER") {
    navLinks = [
      { name: "Overview", href: "/dashboard/sales-manager", icon: LayoutDashboard, roles: ["SALES_MANAGER"] },
      { name: "Employees", href: "/dashboard/sales-manager/employees", icon: Users, roles: ["SALES_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/sales-manager/lead-management", icon: List, roles: ["SALES_MANAGER"] },
      { name: "Approval", href: "/dashboard/sales-manager/approval", icon: CheckSquare, roles: ["SALES_MANAGER"] },
      { name: "Inventory", href: "/dashboard/sales-manager/inventory", icon: Package, roles: ["SALES_MANAGER"] },
      { name: "Booking", href: "/dashboard/sales-manager/booking", icon: Calendar, roles: ["SALES_MANAGER"] },
      { name: "Marketing", href: "/dashboard/marketing", icon: Mail, roles: ["SALES_MANAGER"] },
      { name: "Analytics", href: "/dashboard/sales-manager/analytics", icon: BarChart2, roles: ["SALES_MANAGER"] },
      { name: "Settings", href: "/dashboard/sales-manager/settings", icon: Settings, roles: ["SALES_MANAGER"] },
    ];
  } else if (userRole === "POST_SALES") {
    navLinks = [
      { name: "Overview", href: "/dashboard/post-sales", icon: LayoutDashboard, roles: ["POST_SALES"] },
      { name: "Lead Management", href: "/dashboard/post-sales/lead-management", icon: List, roles: ["POST_SALES"] },
      { name: "Inventory", href: "/dashboard/post-sales/inventory", icon: Package, roles: ["POST_SALES"] },
      { name: "Commissions", href: "/dashboard/post-sales/commissions", icon: Handshake, roles: ["POST_SALES"] },
      { name: "Handover", href: "/dashboard/post-sales/handover", icon: Handshake, roles: ["POST_SALES"] },
      { name: "Analytics", href: "/dashboard/post-sales/analytics", icon: BarChart2, roles: ["POST_SALES"] },
      { name: "Settings", href: "/dashboard/post-sales/settings", icon: Settings, roles: ["POST_SALES"] },
    ];
  } else if (userRole === "POST_SALES_MANAGER") {
    navLinks = [
      { name: "Overview", href: "/dashboard/post-sales-manager", icon: LayoutDashboard, roles: ["POST_SALES_MANAGER"] },
      { name: "Employees", href: "/dashboard/post-sales-manager/employees", icon: Users, roles: ["POST_SALES_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/post-sales-manager/lead-management", icon: List, roles: ["POST_SALES_MANAGER"] },
      { name: "Commissions", href: "/dashboard/post-sales-manager/commissions", icon: Handshake, roles: ["POST_SALES_MANAGER"] },
      { name: "Handover", href: "/dashboard/post-sales-manager/handover", icon: Handshake, roles: ["POST_SALES_MANAGER"] },
      { name: "Analytics", href: "/dashboard/post-sales-manager/analytics", icon: BarChart2, roles: ["POST_SALES_MANAGER"] },
      { name: "Settings", href: "/dashboard/post-sales-manager/settings", icon: Settings, roles: ["POST_SALES_MANAGER"] },
    ];
  } else if (userRole === "SOURCING_MANAGER") {
    navLinks = [
      { name: "Overview", href: "/dashboard/sourcing-manager", icon: LayoutDashboard, roles: ["SOURCING_MANAGER"] },
      { name: "Broker Management", href: "/dashboard/sourcing-manager/broker-management", icon: Handshake, roles: ["SOURCING_MANAGER"] },
      { name: "Commissions", href: "/dashboard/sourcing-manager/commissions", icon: Handshake, roles: ["SOURCING_MANAGER"] },
      { name: "Inventory", href: "/dashboard/sourcing-manager/inventory", icon: Package, roles: ["SOURCING_MANAGER"] },
      { name: "Analytics", href: "/dashboard/sourcing-manager/analytics", icon: BarChart2, roles: ["SOURCING_MANAGER"] },
      { name: "Settings", href: "/dashboard/sourcing-manager/settings", icon: Settings, roles: ["SOURCING_MANAGER"] },
    ];
  } else if (userRole === "CLOSING_MANAGER") {
    navLinks = [
      { name: "Overview", href: "/dashboard/closing-manager", icon: LayoutDashboard, roles: ["CLOSING_MANAGER"] },
      { name: "Inventory", href: "/dashboard/closing-manager/inventory", icon: Package, roles: ["CLOSING_MANAGER"] },
      { name: "Lead Management", href: "/dashboard/closing-manager/lead-management", icon: List, roles: ["CLOSING_MANAGER"] },
      { name: "Broker Management", href: "/dashboard/closing-manager/broker-management", icon: Handshake, roles: ["CLOSING_MANAGER"] },
      { name: "Handover", href: "/dashboard/closing-manager/handover", icon: CheckSquare, roles: ["CLOSING_MANAGER"] },
      { name: "Analytics", href: "/dashboard/closing-manager/analytics", icon: BarChart2, roles: ["CLOSING_MANAGER"] },
      { name: "Settings", href: "/dashboard/closing-manager/settings", icon: Settings, roles: ["CLOSING_MANAGER"] },
    ];
  } else if (userRole === "CHANNEL_PARTNER") {
    navLinks = [
      { name: "Overview", href: "/dashboard/channel-partner", icon: LayoutDashboard, roles: ["CHANNEL_PARTNER"] },
      { name: "Customer Management", href: "/dashboard/channel-partner/customer-management", icon: Users, roles: ["CHANNEL_PARTNER"] },
      { name: "Employees", href: "/dashboard/channel-partner/employees", icon: Briefcase, roles: ["CHANNEL_PARTNER"] },
      { name: "Broker Management", href: "/dashboard/channel-partner/broker-management", icon: Handshake, roles: ["CHANNEL_PARTNER"] },
      { name: "Inventory", href: "/dashboard/channel-partner/inventory", icon: Package, roles: ["CHANNEL_PARTNER"] },
      { name: "Analytics", href: "/dashboard/channel-partner/analytics", icon: BarChart2, roles: ["CHANNEL_PARTNER"] },
      { name: "Settings", href: "/dashboard/channel-partner/settings", icon: Settings, roles: ["CHANNEL_PARTNER"] },
    ];
  } else if (userRole === "BUSINESS_MANAGER") {
    navLinks = [
      { name: "Overview", href: "/dashboard/business-manager", icon: LayoutDashboard, roles: ["BUSINESS_MANAGER"] },
      { name: "Leads", href: "/dashboard/business-manager/leads", icon: Users, roles: ["BUSINESS_MANAGER"] },
      { name: "Inventory", href: "/dashboard/business-manager/inventory", icon: Package, roles: ["BUSINESS_MANAGER"] },
      { name: "Financials", href: "/dashboard/business-manager/financials", icon: DollarSign, roles: ["BUSINESS_MANAGER"] },
      { name: "Employees", href: "/dashboard/business-manager/employees", icon: Briefcase, roles: ["BUSINESS_MANAGER"] },
      { name: "Marketing", href: "/dashboard/marketing", icon: Mail, roles: ["BUSINESS_MANAGER"] },
      { name: "Analytics", href: "/dashboard/business-manager/analytics", icon: BarChart2, roles: ["BUSINESS_MANAGER"] },
    ];
  } else if (userRole === "DIRECTOR") {
    navLinks = [
      { name: "Overview", href: "/dashboard/director", icon: LayoutDashboard, roles: ["DIRECTOR"] },
      { name: "Pre-Sales", href: "/dashboard/pre-sales", icon: Users, roles: ["DIRECTOR"] },
      { name: "Sales", href: "/dashboard/sales", icon: Briefcase, roles: ["DIRECTOR"] },
      { name: "Marketing", href: "/dashboard/marketing", icon: Mail, roles: ["DIRECTOR"] },
      { name: "Post-Sales", href: "/dashboard/post-sales", icon: Handshake, roles: ["DIRECTOR"] },
      { name: "Finance", href: "/dashboard/finance", icon: DollarSign, roles: ["DIRECTOR"] },
    ];
  } else if (userRole === "MARKETING") {
    const isEmailSub = pathname.startsWith("/dashboard/marketing/email");
    const isSmsSub = pathname.startsWith("/dashboard/marketing/sms");
    const isVoiceSub = pathname.startsWith("/dashboard/marketing/voice");
    const isAdsSub = pathname.startsWith("/dashboard/marketing/ads");
    if (isEmailSub) {
      navLinks = [
        { name: "Email Overview", href: "/dashboard/marketing/email", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "New Campaign", href: "/dashboard/marketing/email/campaigns/new", icon: Star, roles: ["MARKETING"] },
        { name: "Email Settings", href: "/dashboard/marketing/email/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    } else if (isSmsSub) {
      navLinks = [
        { name: "SMS Overview", href: "/dashboard/marketing/sms", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "New SMS Campaign", href: "/dashboard/marketing/sms/campaigns/new", icon: Star, roles: ["MARKETING"] },
        { name: "SMS Gateways & DLT", href: "/dashboard/marketing/sms/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    } else if (isVoiceSub) {
      navLinks = [
        { name: "Voice Overview", href: "/dashboard/marketing/voice", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "New Voice Call", href: "/dashboard/marketing/voice/campaigns/new", icon: PhoneCall, roles: ["MARKETING"] },
        { name: "Carrier & AI Gateways", href: "/dashboard/marketing/voice/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    } else if (isAdsSub) {
      navLinks = [
        { name: "Ads Hub Overview", href: "/dashboard/marketing/ads", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "Meta (Facebook) Ads", href: "/dashboard/marketing/ads/meta", icon: Globe, roles: ["MARKETING"] },
        { name: "Instagram Ads", href: "/dashboard/marketing/ads/instagram", icon: InstagramIcon, roles: ["MARKETING"] },
        { name: "Google Ads", href: "/dashboard/marketing/ads/google", icon: Search, roles: ["MARKETING"] },
        { name: "YouTube Video Ads", href: "/dashboard/marketing/ads/youtube", icon: Video, roles: ["MARKETING"] },
      ];
    } else {
      navLinks = [
        { name: "Overview", href: "/dashboard/marketing", icon: LayoutDashboard, roles: ["MARKETING"] },
        { name: "Ads Marketing", href: "/dashboard/marketing/ads", icon: Globe, roles: ["MARKETING"] },
        { name: "AI Voice Calling", href: "/dashboard/marketing/voice", icon: Phone, roles: ["MARKETING"] },
        { name: "SMS Campaigns", href: "/dashboard/marketing/sms", icon: MessageSquare, roles: ["MARKETING"] },
        { name: "Email Marketing", href: "/dashboard/marketing/email", icon: Mail, roles: ["MARKETING"] },
        { name: "WhatsApp Campaigns", href: "/dashboard/marketing/whatsapp", icon: Radio, roles: ["MARKETING"] },
        { name: "Analytics", href: "/dashboard/marketing/analytics", icon: BarChart2, roles: ["MARKETING"] },
        { name: "Settings & BYO", href: "/dashboard/marketing/settings", icon: Settings, roles: ["MARKETING"] },
      ];
    }
  }

  const userEmail = session?.user?.email || "";
  const userInitials = userEmail.slice(0, 2).toUpperCase() || "US";

  /* ── Active Page Title ───────────────────────────────────────────── */
  const activeLink = navLinks.find((link) => {
    if (link.name === "Overview") return pathname === link.href;
    return pathname === link.href || pathname.startsWith(link.href + "/");
  });
  const pageTitle = activeLink?.name || "Dashboard";

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)] overflow-hidden font-sans text-[var(--text-primary)]">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col relative z-20 shadow-xs">
        {/* Sidebar Brand Header */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 text-decoration-none group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
              style={{ background: roleConfig.accent }}
            >
              <Building2 className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
                Broker<span style={{ color: roleConfig.accent }}>OS</span>
              </div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] mt-1 tracking-tight">
                {roleConfig.label}
              </div>
            </div>
          </Link>

          {/* System Live Dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>

        {/* Nav Links List */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {(pathname.startsWith("/dashboard/marketing/email") || pathname.startsWith("/dashboard/marketing/sms") || pathname.startsWith("/dashboard/marketing/voice")) && (
            <Link
              href="/dashboard/marketing"
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl mb-3 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--brand-600)] transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Marketing Hub</span>
            </Link>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/dashboard/marketing" ||
                link.href === "/dashboard/marketing/email" ||
                link.href === "/dashboard/marketing/sms" ||
                link.href === "/dashboard/marketing/voice"
                ? pathname === link.href
                : link.name.toLowerCase().includes("overview")
                  ? pathname === link.href
                  : pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${isActive
                  ? "text-[var(--text-primary)] shadow-xs"
                  : "text-[var(--text-tertiary)] hover:bg-slate-50 hover:text-[var(--text-primary)]"
                  }`}
                style={{
                  background: isActive ? roleConfig.bg : "transparent",
                  color: isActive ? roleConfig.accent : undefined,
                }}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ background: roleConfig.accent }}
                    transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 mb-2 border border-slate-100">
            <div
              className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-extrabold flex-shrink-0"
              style={{ background: roleConfig.accent }}
            >
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                {userEmail}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-medium truncate">
                {roleConfig.label}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-[0.96] press-effect disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{isLoggingOut ? "Signing out…" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Shell ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200/80 flex items-center justify-between px-7 flex-shrink-0 z-20">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Workspace</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="font-extrabold text-[var(--text-primary)]">{pageTitle}</span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <NotificationBell />
          </div>
        </header>

        {/* Dynamic Page Content View */}
        <main className="flex-1 overflow-y-auto p-7 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Real-time Global Team Chat Widget */}
      <ChatWidget />
    </div>
  );
}
