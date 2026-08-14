"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut, LayoutDashboard, Building2, Briefcase, ShieldCheck,
  DollarSign, Handshake, Users, TrendingUp, BarChart2, Star,
  List, CheckSquare, Calendar, Package, Settings, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ChatWidget } from "@/components/chat/ChatWidget";

/* ─── Role color mapping (each role gets a tinted sidebar accent) ─ */
const ROLE_COLORS: Record<string, { accent: string; bg: string }> = {
  PRE_SALES: { accent: "#7c3aed", bg: "rgba(124,58,237,0.06)" },
  PRE_SALES_MANAGER: { accent: "#6d28d9", bg: "rgba(109,40,217,0.06)" },
  SALES_EXECUTIVE: { accent: "#0369a1", bg: "rgba(3,105,161,0.06)" },
  SALES_MANAGER: { accent: "#0e7490", bg: "rgba(14,116,144,0.06)" },
  POST_SALES: { accent: "#15803d", bg: "rgba(21,128,61,0.06)" },
  SOURCING_MANAGER: { accent: "#b45309", bg: "rgba(180,83,9,0.06)" },
  CLOSING_MANAGER: { accent: "#be123c", bg: "rgba(190,18,60,0.06)" },
  CHANNEL_PARTNER: { accent: "#7c3aed", bg: "rgba(124,58,237,0.06)" },
  FINANCE: { accent: "#0f766e", bg: "rgba(15,118,110,0.06)" },
  BUSINESS_MANAGER: { accent: "#6d28d9", bg: "rgba(109,40,217,0.06)" },
  DIRECTOR: { accent: "#1e40af", bg: "rgba(30,64,175,0.06)" },
  ADMIN: { accent: "#991b1b", bg: "rgba(153,27,27,0.06)" },
};

/* ─── Role display names ─────────────────────────────────────────── */
const ROLE_DISPLAY: Record<string, string> = {
  PRE_SALES: "Pre-Sales",
  PRE_SALES_MANAGER: "Pre-Sales Manager",
  SALES_EXECUTIVE: "Sales Executive",
  SALES_MANAGER: "Sales Manager",
  POST_SALES: "Post-Sales",
  SOURCING_MANAGER: "Sourcing Manager",
  CLOSING_MANAGER: "Closing Manager",
  CHANNEL_PARTNER: "Channel Partner",
  FINANCE: "Finance",
  BUSINESS_MANAGER: "Business Manager",
  DIRECTOR: "Director",
  ADMIN: "Administrator",
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
        .then(res => res.json())
        .then(roles => {
          const role = roles.find((r: any) => r.id === user.roleId);
          if (role) setRoleCode(role.code);
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

  /* ── Loading state ─────────────────────────────────── */
  if (isPending || fetchingRoles) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        gap: 16,
      }}>
        {/* Branded spinner — not a plain blue ring */}
        <div style={{ position: "relative", width: 40, height: 40 }}>
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid var(--brand-100)",
          }} />
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2.5px solid transparent",
            borderTopColor: "var(--brand-600)",
            animation: "spin 0.75s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}>
          Loading your workspace…
        </p>
      </div>
    );
  }

  /* ── Nav link definitions ─────────────────────────── */
  const allNavLinks = [
    { name: "Pre-Sales", href: "/dashboard/pre-sales", icon: Users, roles: ["PRE_SALES", "PRE_SALES_MANAGER", "DIRECTOR", "ADMIN"] },
    { name: "Sales", href: "/dashboard/sales", icon: Briefcase, roles: ["SALES_EXECUTIVE", "SALES_MANAGER", "DIRECTOR", "ADMIN"] },
    { name: "Post-Sales", href: "/dashboard/post-sales", icon: Handshake, roles: ["POST_SALES", "DIRECTOR", "ADMIN"] },
    { name: "Finance", href: "/dashboard/finance", icon: DollarSign, roles: ["FINANCE", "BUSINESS_MANAGER", "DIRECTOR", "ADMIN"] },
    { name: "Business Mgr", href: "/dashboard/business-manager", icon: Building2, roles: ["BUSINESS_MANAGER", "DIRECTOR", "ADMIN"] },
    { name: "Director", href: "/dashboard/director", icon: ShieldCheck, roles: ["DIRECTOR", "ADMIN"] },
    { name: "Admin", href: "/dashboard/admin", icon: ShieldCheck, roles: ["ADMIN"] },
    { name: "Sourcing Mgr", href: "/dashboard/sourcing-manager", icon: Users, roles: ["SOURCING_MANAGER", "DIRECTOR", "ADMIN"] },
    { name: "Closing Mgr", href: "/dashboard/closing-manager", icon: Handshake, roles: ["CLOSING_MANAGER", "DIRECTOR", "ADMIN"] },
    { name: "Channel Partner", href: "/dashboard/channel-partner", icon: Users, roles: ["CHANNEL_PARTNER", "DIRECTOR", "ADMIN"] },
  ];

  const userRole = roleCode || "UNKNOWN";
  let navLinks = allNavLinks.filter(link => link.roles.includes("*") || link.roles.includes(userRole));

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
      { name: "Analytics", href: "/dashboard/business-manager/analytics", icon: BarChart2, roles: ["BUSINESS_MANAGER"] },
    ];
  }

  const roleColors = ROLE_COLORS[userRole] || ROLE_COLORS["PRE_SALES"];
  const roleDisplayName = ROLE_DISPLAY[userRole] || userRole;
  const userEmail = session?.user?.email || "";
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  /* ── Active page title ─────────────────────────────── */
  const activeLink = navLinks.find(link => {
    if (link.name === "Overview") return pathname === link.href;
    return pathname === link.href || pathname.startsWith(link.href + "/");
  });
  const pageTitle = activeLink?.name || "Dashboard";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "var(--bg-base)",
      overflow: "hidden",
    }}>
      {/* ── Sidebar ────────────────────────────────── */}
      <aside style={{
        width: 252,
        flexShrink: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 20,
      }}>

        {/* Sidebar top — brand */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-md)",
              background: roleColors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                border: "2px solid rgba(255,255,255,0.85)",
                background: "transparent",
              }} />
            </div>
            <div>
              <div style={{
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}>
                OpenEstate
              </div>
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-muted)",
                letterSpacing: "0.01em",
              }}>
                {roleDisplayName}
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }} className="scrollbar-hide">
          {navLinks.map((link, i) => {
            const Icon = link.icon;
            const isActive = link.name === "Overview"
              ? pathname === link.href
              : (pathname === link.href || pathname.startsWith(link.href + "/"));

            return (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: EASE_OUT_EXPO }}
              >
                <Link
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: 2,
                    textDecoration: "none",
                    position: "relative",
                    transition: `
                      background var(--duration-base) var(--ease-out-expo),
                      color var(--duration-base) var(--ease-out-expo)
                    `,
                    background: isActive ? roleColors.bg : "transparent",
                    color: isActive ? roleColors.accent : "var(--text-tertiary)",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                    }
                  }}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        borderRadius: "0 var(--radius-full) var(--radius-full) 0",
                        background: roleColors.accent,
                      }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                    />
                  )}
                  <Icon
                    size={15}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{ flexShrink: 0, color: "inherit" }}
                  />
                  <span style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: isActive ? 650 : 500,
                    letterSpacing: "-0.01em",
                    color: "inherit",
                  }}>
                    {link.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{
          padding: "12px 10px",
          borderTop: "1px solid var(--border-subtle)",
        }}>
          {/* User info row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            marginBottom: 8,
            background: "var(--bg-subtle)",
          }}>
            {/* Avatar */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: roleColors.accent,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}>
              {userInitials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-secondary)",
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {userEmail}
              </div>
              <div style={{
                fontSize: 10,
                fontWeight: 500,
                color: "var(--text-muted)",
                marginTop: 1,
              }}>
                {roleDisplayName}
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              cursor: "pointer",
              transition: `
                background var(--duration-base) var(--ease-out-expo),
                color var(--duration-base) var(--ease-out-expo)
              `,
              opacity: isLoggingOut ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--danger-bg)";
              (e.currentTarget as HTMLElement).style.color = "var(--danger-fg)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <LogOut size={14} strokeWidth={2} />
            <span>{isLoggingOut ? "Signing out…" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100vh",
        overflow: "hidden",
      }}>
        {/* Top header bar */}
        <header style={{
          height: 56,
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          flexShrink: 0,
          position: "relative",
          zIndex: 20,
        }}>
          {/* Page title with breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color: "var(--text-muted)",
              letterSpacing: "0.01em",
            }}>
              Dashboard
            </span>
            <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />
            <span style={{
              fontSize: "var(--text-sm)",
              fontWeight: 650,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}>
              {pageTitle}
            </span>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NotificationBell />
          </div>
        </header>

        {/* Page content — animated on route change */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
          }}
          className="scrollbar-hide"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
              style={{ minHeight: "100%" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global floating chat widget */}
      <ChatWidget />
    </div>
  );
}
