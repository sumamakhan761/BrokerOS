import React from 'react';
import { Target, CheckCircle, Clock, FileText, Banknote, IndianRupee, PieChart, Activity, CheckSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function DetailedMetricsGrid({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  const { salesFunnel, teamAnalytics, revenueAnalytics } = metrics;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 24,
      marginBottom: 32,
      marginTop: 32
    }}>
      {/* Sales Funnel Analytics */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
        <h3 style={{
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
          margin: "0 0 24px 0"
        }}>
          <PieChart size={20} style={{ color: "var(--brand-500)" }} />
          Sales Funnel Analytics
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <MetricRow icon={<Target size={16} style={{ color: "var(--brand-500)" }} />} label="Assigned Customers" value={salesFunnel.assignedCustomers} />
          <MetricRow icon={<Clock size={16} style={{ color: "#f59e0b" }} />} label="Site Visits Scheduled" value={salesFunnel.siteVisitsScheduled} />
          <MetricRow icon={<CheckCircle size={16} style={{ color: "#10b981" }} />} label="Site Visits Completed" value={salesFunnel.siteVisitsCompleted} />
          <MetricRow icon={<FileText size={16} style={{ color: "#3b82f6" }} />} label="Negotiations" value={salesFunnel.negotiations} />
          <MetricRow icon={<CheckSquare size={16} style={{ color: "#8b5cf6" }} />} label="Follow-ups Completed" value={teamAnalytics.followUpsCompleted} />
          <MetricRow icon={<Banknote size={16} style={{ color: "#059669" }} />} label="Confirmed Bookings" value={salesFunnel.confirmedBookings} />
          <div style={{
            paddingTop: 16,
            borderTop: "1px solid var(--border-subtle)",
            marginTop: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>Booking Conversion Rate</span>
              <span style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--text-primary)" }}>{salesFunnel.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gridColumn: "span 2"
      }}>
        <h3 style={{
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
          margin: "0 0 24px 0"
        }}>
          <IndianRupee size={20} style={{ color: "#f59e0b" }} />
          Revenue Analytics
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          marginBottom: 24
        }}>
          <RevenueCard label="Daily Revenue" value={revenueAnalytics.daily} />
          <RevenueCard label="Weekly Revenue" value={revenueAnalytics.weekly} />
          <RevenueCard label="Monthly Revenue" value={revenueAnalytics.monthly} />
          <RevenueCard label="Quarterly Revenue" value={revenueAnalytics.quarterly} />
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 12,
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-lg)",
          marginBottom: 16,
          border: "1px solid var(--border-subtle)"
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>Avg Booking Value</span>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 800, color: "var(--text-primary)" }}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenueAnalytics.averageBookingValue)}
          </span>
        </div>

        <div style={{ flex: 1, minHeight: 150, display: "flex", flexDirection: "column" }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 8,
            display: "block"
          }}>Revenue Trend (Last 7 Days)</span>
          <div style={{ flex: 1, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={150}>
              <AreaChart data={revenueAnalytics.trend}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  formatter={(value: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--shadow-sm)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: "var(--radius-lg)",
      transition: "background 150ms ease",
      cursor: "default"
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.background = "transparent";
    }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          padding: 8,
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 150ms ease"
        }}>
          {icon}
        </div>
        <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <span style={{
        fontSize: "var(--text-sm)",
        fontWeight: 800,
        color: "var(--text-primary)",
        background: "var(--bg-subtle)",
        padding: "4px 12px",
        borderRadius: "var(--radius-full)"
      }}>
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function RevenueCard({ label, value }: { label: string, value: number }) {
  return (
    <div style={{
      padding: 16,
      background: "var(--bg-subtle)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 4,
        display: "block"
      }}>{label}</span>
      <span style={{
        fontSize: "var(--text-lg)",
        fontWeight: 800,
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}>
        {value >= 10000000
          ? `₹${(value / 10000000).toFixed(2)} Cr`
          : value >= 100000
            ? `₹${(value / 100000).toFixed(2)} L`
            : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
        }
      </span>
    </div>
  );
}
