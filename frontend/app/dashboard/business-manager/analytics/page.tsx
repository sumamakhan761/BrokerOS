"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Calendar, PieChart as PieChartIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
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

export default function BusinessManagerAnalytics() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const res = await authClient.$fetch(
          `/api/dashboard/business-manager/analytics?period=${period}`,
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

  // Transform data for charts
  const leadPipelineData = data?.leadPipeline
    ? [
        {
          stage: "New",
          Brokerage: data.leadPipeline.brokerage.NEW || 0,
          CP: data.leadPipeline.cp.NEW || 0,
        },
        {
          stage: "Contacted",
          Brokerage: data.leadPipeline.brokerage.CONTACTED || 0,
          CP: data.leadPipeline.cp.CONTACTED || 0,
        },
        {
          stage: "Interested",
          Brokerage: data.leadPipeline.brokerage.INTERESTED || 0,
          CP: data.leadPipeline.cp.INTERESTED || 0,
        },
        {
          stage: "Qualified",
          Brokerage: data.leadPipeline.brokerage.QUALIFIED || 0,
          CP: data.leadPipeline.cp.QUALIFIED || 0,
        },
        {
          stage: "Site Visit",
          Brokerage: data.leadPipeline.brokerage.SITE_VISIT_SCHEDULED || 0,
          CP: data.leadPipeline.cp.SITE_VISIT_SCHEDULED || 0,
        },
        {
          stage: "Negotiation",
          Brokerage: data.leadPipeline.brokerage.NEGOTIATION || 0,
          CP: data.leadPipeline.cp.NEGOTIATION || 0,
        },
        {
          stage: "Booking",
          Brokerage: data.leadPipeline.brokerage.BOOKING || 0,
          CP: data.leadPipeline.cp.BOOKING || 0,
        },
      ]
    : [];

  const bookingFunnelData = data?.bookingFunnel
    ? [
        {
          stage: "Confirmed",
          Brokerage: data.bookingFunnel.brokerage.confirmed || 0,
          CP: data.bookingFunnel.cp.confirmed || 0,
        },
        {
          stage: "Documentation",
          Brokerage: data.bookingFunnel.brokerage.documentation || 0,
          CP: data.bookingFunnel.cp.documentation || 0,
        },
        {
          stage: "Loan/Agreement",
          Brokerage: data.bookingFunnel.brokerage.loanAgreement || 0,
          CP: data.bookingFunnel.cp.loanAgreement || 0,
        },
        {
          stage: "Possession",
          Brokerage: data.bookingFunnel.brokerage.possession || 0,
          CP: data.bookingFunnel.cp.possession || 0,
        },
        {
          stage: "Handover",
          Brokerage: data.bookingFunnel.brokerage.handover || 0,
          CP: data.bookingFunnel.cp.handover || 0,
        },
      ]
    : [];

  const paymentData = data?.paymentEfficiency
    ? [
        { name: "Collected", value: data.paymentEfficiency.totalCollected },
        { name: "Outstanding", value: data.paymentEfficiency.outstanding },
      ]
    : [];
  const PAYMENT_COLORS = ["#10b981", "#f59e0b"];

  const renderCard = (title: string, children: React.ReactNode) => (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        boxShadow: "var(--shadow-sm)",
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
      <div style={{ height: 300 }}>{children}</div>
    </div>
  );

  return (
    <DashboardPageWrapper
      loading={status === "loading" && !data}
      error={status === "error" ? "Failed to load Analytics data." : null}
      title="Business Analytics"
      subtitle="Deep dive into cross-business operations and trends."
      headerRight={periodSelector}
    >
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Revenue Trend */}
          {renderCard(
            "Revenue Trend (Brokerage vs CP)",
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend}>
                <defs>
                  <linearGradient id="colorBrok" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis
                  tickFormatter={(val) => formatCurrency(val)}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="brokerage"
                  name="Brokerage"
                  stackId="1"
                  stroke="#6366f1"
                  fill="url(#colorBrok)"
                />
                <Area
                  type="monotone"
                  dataKey="cp"
                  name="Channel Partner"
                  stackId="1"
                  stroke="#0ea5e9"
                  fill="url(#colorCp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* Lead Pipeline Comparison */}
          {renderCard(
            "Lead Pipeline Funnel",
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadPipelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Brokerage" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CP" name="Channel Partner" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Booking Funnel Comparison */}
          {renderCard(
            "Booking Progression",
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingFunnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Brokerage" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="CP" name="Channel Partner" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Payment Collection Efficiency */}
          {renderCard(
            "Payment Collection Efficiency",
            <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, paddingLeft: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Total Payable</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                    {formatCurrency(data.paymentEfficiency?.totalPayable || 0)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: PAYMENT_COLORS[0] }} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Collected</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatCurrency(data.paymentEfficiency?.totalCollected || 0)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: PAYMENT_COLORS[1] }} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Outstanding</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatCurrency(data.paymentEfficiency?.outstanding || 0)}
                    </div>
                  </div>
                </div>
                {data.paymentEfficiency?.overdue > 0 && (
                  <div style={{ padding: "8px 12px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                    <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>OVERDUE AMOUNT</div>
                    <div style={{ fontSize: 14, color: "#dc2626", fontWeight: 800 }}>
                      {formatCurrency(data.paymentEfficiency.overdue)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expense vs Revenue */}
          {renderCard(
            "Expense vs Revenue Trend",
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.expenseRevenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(val) => formatCurrency(val)}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(val) => formatCurrency(val)}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {/* Lead Conversion Trend */}
          {renderCard(
            "Lead Conversion (Leads to Bookings)",
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.leadConversionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="leads" name="New Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </DashboardPageWrapper>
  );
}
