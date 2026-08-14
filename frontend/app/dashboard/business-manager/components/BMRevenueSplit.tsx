"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RevenueItem {
  brokerage: number;
  cp: number;
  total: number;
  brokeragePercent: number;
  cpPercent: number;
}

export function BMRevenueSplit({ revenueByBusiness }: { revenueByBusiness: RevenueItem }) {
  if (!revenueByBusiness) return null;

  const { brokerage, cp, total, brokeragePercent, cpPercent } = revenueByBusiness;

  const formatCr = (n: number) =>
    n >= 10000000
      ? `₹${(n / 10000000).toFixed(2)}Cr`
      : n >= 100000
        ? `₹${(n / 100000).toFixed(1)}L`
        : `₹${n.toLocaleString("en-IN")}`;

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--text-lg)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Revenue Split
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "var(--text-sm)",
              color: "var(--text-muted)",
            }}
          >
            Brokerage vs Channel Partner
          </p>
        </div>
        <div
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          {formatCr(total)}
        </div>
      </div>

      {/* Split bar */}
      <div
        style={{
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--bg-subtle)",
          marginBottom: 16,
          display: "flex",
        }}
      >
        <div
          style={{
            width: `${brokeragePercent}%`,
            background: "linear-gradient(90deg, #6366f1, #818cf8)",
            transition: "width 800ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <div
          style={{
            width: `${cpPercent}%`,
            background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
            transition: "width 800ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>

      {/* Legends */}
      <div style={{ display: "flex", gap: 24 }}>
        {/* Brokerage */}
        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            background: "#6366f110",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #6366f125",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: "linear-gradient(90deg, #6366f1, #818cf8)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6366f1",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Brokerage
            </span>
          </div>
          <div
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatCr(brokerage)}
          </div>
          <div
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "#6366f1",
              marginTop: 2,
            }}
          >
            {brokeragePercent}% of total
          </div>
        </div>

        {/* CP */}
        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            background: "#0ea5e910",
            borderRadius: "var(--radius-lg)",
            border: "1px solid #0ea5e925",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#0ea5e9",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Channel Partner
            </span>
          </div>
          <div
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {formatCr(cp)}
          </div>
          <div
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "#0ea5e9",
              marginTop: 2,
            }}
          >
            {cpPercent}% of total
          </div>
        </div>
      </div>
    </div>
  );
}
