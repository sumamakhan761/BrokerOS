"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { BMRevenueSplit } from "./components/BMRevenueSplit";
import { BMLeaderboards } from "./components/BMLeaderboards";
import { BMActionItems } from "./components/BMActionItems";
import { BMBusinessOverview } from "./components/BMBusinessOverview";
import {
  DollarSign,
  BookOpen,
  TrendingUp,
  Users,
  Briefcase,
  AlertCircle,
  Calendar,
  BarChart2,
} from "lucide-react";

type Period = "weekly" | "monthly" | "yearly" | "all-time";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

export default function BusinessManagerDashboard() {
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const res = await authClient.$fetch(
          `/api/dashboard/business-manager?period=${period}`,
          { baseURL: BASE_URL }
        );
        if ((res as any).error) throw new Error("Failed");
        setData((res as any).data ?? res);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    }
    fetchData();
  }, [period]);

  const kpis = data?.kpis;

  function formatRevenue(n: number): string {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  }

  const statItems = kpis
    ? [
        {
          label: "Total Revenue",
          value: formatRevenue(kpis.totalRevenue ?? 0),
          icon: DollarSign,
          accent: "#10b981",
          sub: `Brokerage + CP`,
        },
        {
          label: "Total Bookings",
          value: kpis.totalBookings ?? 0,
          icon: BookOpen,
          accent: "#6366f1",
          sub: `${kpis.brokerageBookings ?? 0} brok · ${kpis.cpBookings ?? 0} CP`,
        },
        {
          label: "Total Leads",
          value: kpis.totalLeads ?? 0,
          icon: TrendingUp,
          accent: "#0ea5e9",
          sub: `${kpis.brokerageLeads ?? 0} brok · ${kpis.cpLeads ?? 0} CP`,
        },
        {
          label: "Total Employees",
          value: kpis.totalEmployees ?? 0,
          icon: Users,
          accent: "#8b5cf6",
        },
        {
          label: "Registered Brokers",
          value: kpis.totalBrokers ?? 0,
          icon: Briefcase,
          accent: "#f59e0b",
        },
        {
          label: "Pending Commissions",
          value: formatRevenue(kpis.pendingCommissions ?? 0),
          icon: AlertCircle,
          accent: "#ef4444",
          sub: `Brokerage owed to brokers`,
        },
        {
          label: "Overdue Payments",
          value: kpis.overduePayments ?? 0,
          icon: BarChart2,
          accent: "#f97316",
          sub: `Collection records overdue`,
        },
      ]
    : [];

  // Period selector
  const periodSelector = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        padding: "8px 14px",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <Calendar size={14} style={{ color: "var(--text-muted)" }} />
      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value as Period)}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: "var(--text-secondary)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="weekly">This Week</option>
        <option value="monthly">This Month</option>
        <option value="yearly">This Year</option>
        <option value="all-time">All Time</option>
      </select>
    </div>
  );

  return (
    <DashboardPageWrapper
      loading={status === "loading" && !data}
      error={status === "error" ? "Failed to load Business Manager data." : null}
      title="Business Manager"
      subtitle="Cross-business overview — Brokerage &amp; Channel Partner combined."
      headerRight={periodSelector}
    >
      {/* ── KPI Stat Cards ───────────────────────────────────── */}
      {kpis && <StatCards items={statItems} />}

      {/* ── Revenue Split + Business Line Breakdown ─────────── */}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {data.revenueByBusiness && (
            <BMRevenueSplit revenueByBusiness={data.revenueByBusiness} />
          )}
          {kpis && <BMBusinessOverview kpis={kpis} />}
        </div>
      )}

      {/* ── Action Items ─────────────────────────────────────── */}
      {data?.actionItems && data.actionItems.length > 0 && (
        <BMActionItems actionItems={data.actionItems} />
      )}

      {/* ── Leaderboards ─────────────────────────────────────── */}
      {data?.leaderboards && <BMLeaderboards leaderboards={data.leaderboards} />}
    </DashboardPageWrapper>
  );
}
