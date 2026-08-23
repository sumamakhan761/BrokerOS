"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { StatCards } from "@/components/dashboard/StatCards";
import { Calendar, IndianRupee, HandCoins, Receipt, AlertCircle } from "lucide-react";
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

export default function BusinessManagerFinancials() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const res = await authClient.$fetch(
          `/api/dashboard/business-manager/financials?period=${period}`,
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

  const statItems = data
    ? [
      {
        label: "Booked Revenue",
        value: formatCurrency(data.revenue.totalRevenue),
        icon: IndianRupee,
        accent: "#3b82f6",
      },
      {
        label: "Total Collected",
        value: formatCurrency(data.revenue.totalCollected),
        icon: HandCoins,
        accent: "#10b981",
      },
      {
        label: "Total Outstanding",
        value: formatCurrency(data.revenue.totalOutstanding),
        icon: Receipt,
        accent: "#f59e0b",
      },
      {
        label: "Overdue Receivables",
        value: formatCurrency(data.overdueBreakdown.totalOverdueAmount),
        icon: AlertCircle,
        accent: "#ef4444",
        sub: `${data.overdueBreakdown.countOverdue} collection(s) overdue`,
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
      error={status === "error" ? "Failed to load Financials data." : null}
      title="Financials & P&L"
      subtitle="Complete view of revenue, collections, expenses, and commissions."
      headerRight={periodSelector}
    >
      {data && (
        <>
          <StatCards items={statItems} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>

            {/* Expense Breakdown */}
            {renderCard(
              "Operating Expenses by Category",
              <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {data.expensesByCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.expensesByCategory.length === 0 && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No expenses recorded.</div>
                  )}
                  {data.expensesByCategory.map((cat: any, idx: number) => (
                    <div key={cat.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[idx % COLORS.length] }} />
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>
                          {cat.name.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--text-primary)" }}>
                        {formatCurrency(cat.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Aging */}
            {renderCard(
              "Aging Overdue Collections",
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.overdueBreakdown.overdueByDays} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" name="Count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Commissions (Brokerage vs Inbound) */}
            {renderCard(
              "Commissions Overview",
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, height: "100%" }}>
                {/* Outbound (Brokerage) */}
                <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>
                    Brokerage Payouts (Outbound)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>PAID TO PARTNERS</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                        {formatCurrency(data.brokerageCommissions.paid)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>PENDING PAYOUTS</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>
                        {formatCurrency(data.brokerageCommissions.pending)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inbound (From Builders) */}
                <div style={{ background: "var(--bg-subtle)", padding: 16, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 16 }}>
                    Builder Commissions (Inbound)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>RECEIVED FROM BUILDERS</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                        {formatCurrency(data.inboundCommissions.received)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>PENDING INVOICES</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>
                        {formatCurrency(data.inboundCommissions.pending)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices */}
            {renderCard(
              "Invoice Pipeline",
              <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto" }}>
                {data.invoiceStatus.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No invoices found.</div>
                )}
                {data.invoiceStatus.map((inv: any) => {
                  let color = "#64748b";
                  if (inv.name === "PAID") color = "#10b981";
                  if (inv.name === "DRAFT" || inv.name === "PENDING") color = "#f59e0b";
                  if (inv.name === "OVERDUE" || inv.name === "CANCELLED") color = "#ef4444";

                  return (
                    <div
                      key={inv.name}
                      style={{
                        padding: 16,
                        border: `1px solid ${color}40`,
                        background: `${color}10`,
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color, textTransform: "uppercase" }}>{inv.name}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginTop: 4 }}>{inv.count} Invoice(s)</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                        {formatCurrency(inv.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardPageWrapper>
  );
}
