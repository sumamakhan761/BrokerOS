"use client";

import { Building2, Handshake } from "lucide-react";

interface BusinessKpis {
  brokerageRevenue: number;
  cpRevenue: number;
  brokerageBookings: number;
  cpBookings: number;
  brokerageLeads: number;
  cpLeads: number;
  cpCommission: number;
  totalBrokers: number;
}

function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function BizCard({
  label,
  icon: Icon,
  accentColor,
  bg,
  border,
  rows,
}: {
  label: string;
  icon: any;
  accentColor: string;
  bg: string;
  border: string;
  rows: { label: string; value: string | number }[];
}) {
  return (
    <div
      style={{
        flex: 1,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-xl)",
        padding: 22,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background: `${accentColor}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} style={{ color: accentColor }} />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "var(--text-base)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </h3>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BMBusinessOverview({ kpis }: { kpis: BusinessKpis }) {
  if (!kpis) return null;

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h2
        style={{
          margin: "0 0 18px 0",
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        Business Line Breakdown
      </h2>

      <div style={{ display: "flex", gap: 16 }}>
        <BizCard
          label="Brokerage"
          icon={Building2}
          accentColor="#6366f1"
          bg="#6366f108"
          border="#6366f120"
          rows={[
            { label: "Revenue", value: fmt(kpis.brokerageRevenue) },
            { label: "Bookings", value: kpis.brokerageBookings },
            { label: "Active Leads", value: kpis.brokerageLeads },
          ]}
        />
        <BizCard
          label="Channel Partner"
          icon={Handshake}
          accentColor="#0ea5e9"
          bg="#0ea5e908"
          border="#0ea5e920"
          rows={[
            { label: "Revenue", value: fmt(kpis.cpRevenue) },
            { label: "Bookings", value: kpis.cpBookings },
            { label: "Active Brokers", value: kpis.totalBrokers },
            { label: "Commission Due", value: fmt(kpis.cpCommission) },
          ]}
        />
      </div>
    </div>
  );
}
