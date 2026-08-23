"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { DashboardPageWrapper } from "@/components/dashboard/DashboardPageWrapper";
import { Calendar, Users, Target, Award, AlertTriangle, PhoneCall, TrendingUp } from "lucide-react";

type Period = "weekly" | "monthly" | "yearly" | "all-time";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

export default function BusinessManagerEmployees() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>("all-time");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      try {
        const res = await authClient.$fetch(
          `/api/dashboard/business-manager/employees?period=${period}`,
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

  const filteredEmployees = data?.employees?.filter((e: any) => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <DashboardPageWrapper
      loading={status === "loading" && !data}
      error={status === "error" ? "Failed to load Employees data." : null}
      title="Team Performance"
      subtitle="Cross-department employee metrics, targets, and recognitions."
      headerRight={periodSelector}
    >
      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Laggards Alert */}
          {data.laggards?.length > 0 && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-xl)",
              padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#991b1b" }}>Attention Required (Sales Team)</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {data.laggards.map((lag: any) => (
                  <div key={lag.id} style={{
                    background: "white", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid #fee2e2"
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#7f1d1d" }}>{lag.name}</div>
                    <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{lag.reason}</div>
                    <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                      <span>{lag.metrics.calls} Calls</span>
                      <span>{lag.metrics.bookings} Bookings</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directory */}
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            padding: 24,
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)" }}>
                Employee Directory
              </h3>
              <input 
                type="text" 
                placeholder="Search employees or departments..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  width: 300,
                  fontSize: 14,
                  outline: "none"
                }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-default)", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>Employee</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>Department & Role</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>Metrics</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>Target Achievement</th>
                    <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 700, fontSize: 12, textTransform: "uppercase" }}>Recognitions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp: any) => {
                    // Calculate Achievement
                    let targetStr = "No Target";
                    let achievementColor = "var(--text-muted)";
                    if (emp.target) {
                      if (emp.target.bookings > 0) {
                        const pct = Math.round((emp.metrics.bookings / emp.target.bookings) * 100);
                        targetStr = `${pct}% of ${emp.target.bookings} Bookings`;
                        achievementColor = pct >= 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
                      } else if (emp.target.calls > 0) {
                        const pct = Math.round((emp.metrics.calls / emp.target.calls) * 100);
                        targetStr = `${pct}% of ${emp.target.calls} Calls`;
                        achievementColor = pct >= 100 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
                      }
                    }

                    return (
                      <tr key={emp.id} style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-subtle)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        
                        {/* Avatar & Name */}
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {emp.avatar ? (
                              <img src={emp.avatar} alt={emp.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Users size={20} color="#64748b" />
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{emp.name}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department / Role */}
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>{emp.department}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{emp.role}</div>
                        </td>

                        {/* Metrics */}
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: 16 }}>
                            <div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>CALLS</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{emp.metrics.calls}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>VISITS</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{emp.metrics.siteVisits}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>BOOKINGS</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{emp.metrics.bookings}</div>
                            </div>
                          </div>
                        </td>

                        {/* Achievement */}
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Target size={16} color={achievementColor} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: achievementColor }}>{targetStr}</span>
                          </div>
                        </td>

                        {/* Recognitions */}
                        <td style={{ padding: "16px" }}>
                          {emp.recognitions?.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {emp.recognitions.map((rec: string, i: number) => (
                                <div key={i} style={{ padding: "4px 8px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}>
                                  <Award size={12} color="#d97706" />
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#b45309" }}>{rec}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>None</span>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  No employees match your search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardPageWrapper>
  );
}
