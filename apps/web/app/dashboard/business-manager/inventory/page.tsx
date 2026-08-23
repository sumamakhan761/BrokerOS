"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Calendar, Building, CheckCircle2, Lock, Tag, HardHat } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Period = "weekly" | "monthly" | "yearly" | "all-time";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ec4899"];

export default function BusinessManagerInventory() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const res = await authClient.$fetch(
          `/api/dashboard/business-manager/inventory?period=${period}`,
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

  const tInv = data?.totalInventory;
  const statItems = tInv
    ? [
        {
          label: "Total Units",
          value: tInv.total,
          icon: Building,
          accent: "#64748b",
        },
        {
          label: "Available Units",
          value: tInv.available,
          icon: CheckCircle2,
          accent: "#10b981",
        },
        {
          label: "Sold (Brokerage)",
          value: tInv.soldBrokerage,
          icon: Tag,
          accent: "#6366f1",
          sub: `+${tInv.reservedBrokerage} reserved`,
        },
        {
          label: "Sold (Channel Partner)",
          value: tInv.soldCp,
          icon: Tag,
          accent: "#0ea5e9",
          sub: `+${tInv.reservedCp} reserved`,
        },
        {
          label: "Blocked Units",
          value: tInv.blocked,
          icon: Lock,
          accent: "#f59e0b",
        },
      ]
    : [];

  const renderCard = (title: string, children: React.ReactNode) => (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          margin: "0 0 24px 0",
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h3>
      <div style={{ flex: 1, minHeight: 300 }}>{children}</div>
    </div>
  );

  return (
    <DashboardPageWrapper
      loading={status === "loading" && !data}
      error={status === "error" ? "Failed to load Inventory data." : null}
      title="Inventory Overview"
      subtitle="Cross-business project inventory and construction status."
      headerRight={periodSelector}
    >
      {/* ── KPI Stat Cards ───────────────────────────────────── */}
      {tInv && <StatCards items={statItems} />}

      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
          
          {/* Project-wise Unit Status (Stacked Bar) */}
          {renderCard(
            "Project-wise Unit Status",
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.projectWiseStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="available" name="Available" stackId="a" fill="#10b981" />
                <Bar dataKey="reserved" name="Reserved" stackId="a" fill="#3b82f6" />
                <Bar dataKey="sold" name="Sold" stackId="a" fill="#6366f1" />
                <Bar dataKey="blocked" name="Blocked" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Revenue Contribution (Pie Chart) */}
          {renderCard(
            "Revenue Contribution by Project",
            <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={data.revenueContribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="name"
                  >
                    {data.revenueContribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 300 }}>
                {data.revenueContribution.map((proj: any, idx: number) => (
                  <div key={proj.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {proj.name}
                      </span>
                    </div>
                    <span style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--text-primary)" }}>
                      {formatCurrency(proj.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Construction Status Grid */}
          <div style={{ gridColumn: "1 / -1" }}>
            {renderCard(
              "Construction Status",
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                {data.constructionStatus.map((proj: any) => (
                  <div
                    key={proj.name}
                    style={{
                      padding: 16,
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-lg)",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-md)",
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <HardHat size={20} style={{ color: "#64748b" }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)" }}>
                        {proj.name}
                      </h4>
                      <p style={{ margin: "4px 0 0 0", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {proj.status.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
