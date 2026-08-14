"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Calendar, Funnel, Users, Target, Frown, Thermometer, Briefcase } from "lucide-react";
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
  ComposedChart,
  Line,
} from "recharts";

type Period = "weekly" | "monthly" | "yearly" | "all-time";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

export default function BusinessManagerLeads() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const res = await authClient.$fetch(
          `/api/dashboard/business-manager/leads?period=${period}`,
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

  // Format Funnel Data for comparison chart
  const funnelData = data ? [
    { name: "New", Brokerage: data.leadFunnel.brokerage.NEW, CP: data.leadFunnel.cp.NEW },
    { name: "Contacted", Brokerage: data.leadFunnel.brokerage.CONTACTED, CP: data.leadFunnel.cp.CONTACTED },
    { name: "Interested", Brokerage: data.leadFunnel.brokerage.INTERESTED, CP: data.leadFunnel.cp.INTERESTED },
    { name: "Qualified", Brokerage: data.leadFunnel.brokerage.QUALIFIED, CP: data.leadFunnel.cp.QUALIFIED },
    { name: "Negotiation", Brokerage: data.leadFunnel.brokerage.NEGOTIATION, CP: data.leadFunnel.cp.NEGOTIATION },
    { name: "Booking", Brokerage: data.leadFunnel.brokerage.BOOKING, CP: data.leadFunnel.cp.BOOKING },
  ] : [];

  const tempColors = { HOT: "#ef4444", WARM: "#f59e0b", COLD: "#3b82f6" };
  const tempData = data ? [
    { name: "HOT", value: data.temperature.HOT },
    { name: "WARM", value: data.temperature.WARM },
    { name: "COLD", value: data.temperature.COLD },
  ] : [];

  return (
    <DashboardPageWrapper
      loading={status === "loading" && !data}
      error={status === "error" ? "Failed to load Leads Intelligence data." : null}
      title="Lead Intelligence"
      subtitle="Cross-business lead funnels, channel performance, and loss analysis."
      headerRight={periodSelector}
    >
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Top KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>

            {/* Broker Conversion KPI */}
            <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: "var(--radius-xl)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#10b98120", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Target size={24} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>CP Broker Conversion Rate</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{data.brokerConversionRate.rate}%</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{data.brokerConversionRate.bookings} bookings from {data.brokerConversionRate.leads} leads</div>
              </div>
            </div>

            {/* Total Brokerage Leads */}
            <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: "var(--radius-xl)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#3b82f620", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={24} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Brokerage Leads</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                  {String(Object.values(data.leadFunnel.brokerage).reduce((a: any, b: any) => a + b, 0))}
                </div>
              </div>
            </div>

            {/* Total CP Leads */}
            <div style={{ background: "var(--bg-surface)", padding: 24, borderRadius: "var(--radius-xl)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#8b5cf620", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={24} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Total CP Leads</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                  {String(Object.values(data.leadFunnel.cp).reduce((a: any, b: any) => a + b, 0))}
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Funnel Comparison */}
            {renderCard(
              "Brokerage vs CP Funnel",
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Brokerage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="CP" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Source Performance */}
            {renderCard(
              "Lead Sources & Conversions",
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.sourcesBreakdown} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Total Leads" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                  <Line dataKey="bookings" name="Bookings" stroke="#047857" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            )}

            {/* Lost Analysis */}
            {renderCard(
              "Lost Lead Reasons",
              <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", overflowY: "auto" }}>
                {data.lostAnalysis.length === 0 && (
                  <div style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", marginTop: 40 }}>No lost leads in this period.</div>
                )}
                {data.lostAnalysis.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>{item.reason}</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{item.count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Temperature */}
            {renderCard(
              "Pipeline Temperature",
              <div style={{ display: "flex", height: "100%", alignItems: "center" }}>
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={tempData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {tempData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={tempColors[entry.name as keyof typeof tempColors]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  {tempData.map((t: any) => (
                    <div key={t.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Thermometer size={16} color={tempColors[t.name as keyof typeof tempColors]} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>{t.name}</span>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
