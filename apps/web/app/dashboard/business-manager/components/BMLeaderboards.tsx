"use client";

import {
  Award,
  TrendingUp,
  Users,
  Briefcase,
  Target,
} from "lucide-react";

const rankColors = [
  { bg: "#fef9c3", text: "#a16207", border: "#fde68a" },  // Gold
  { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" },  // Silver
  { bg: "#ffedd5", text: "#c2410c", border: "#fed7aa" },  // Bronze
  { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },  // Blue
  { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },  // Green
];

function LeaderboardCard({
  title,
  icon: Icon,
  accentColor,
  items,
  metricLabel,
  metricKey,
  avatarBg,
  avatarColor,
}: {
  title: string;
  icon: any;
  accentColor: string;
  items: any[];
  metricLabel: string;
  metricKey: string;
  avatarBg: string;
  avatarColor: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "var(--radius-md)",
            background: `${accentColor}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} style={{ color: accentColor }} />
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "var(--text-base)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Top 5
          </p>
        </div>
      </div>

      {/* Rows */}
      {items.length === 0 ? (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
            margin: 0,
            textAlign: "center",
            padding: "16px 0",
          }}
        >
          No data available yet
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item: any, idx: number) => {
            const rank = rankColors[Math.min(idx, 4)];
            const name: string = item.name || "Unknown";
            const initial = name[0]?.toUpperCase() || "?";
            const metricValue = item[metricKey] ?? 0;

            return (
              <div
                key={item.id || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid transparent",
                  cursor: "default",
                  transition: "background 150ms ease, border-color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--bg-subtle)";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border-subtle)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Rank badge */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "var(--radius-md)",
                      background: rank.bg,
                      color: rank.text,
                      border: `1px solid ${rank.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </div>

                  {/* Avatar */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: avatarBg,
                      color: avatarColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {initial}
                  </div>

                  {/* Name */}
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {name}
                  </span>
                </div>

                {/* Metric */}
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "var(--text-lg)",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {typeof metricValue === "number" && metricKey !== "commission"
                      ? metricValue
                      : metricValue}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {metricLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function BMLeaderboards({ leaderboards }: { leaderboards: any }) {
  if (!leaderboards) return null;

  const {
    topSalesExecs = [],
    topSourcingManagers = [],
    topClosingManagers = [],
    topBrokers = [],
  } = leaderboards;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      <LeaderboardCard
        title="Top Sales Executives"
        icon={TrendingUp}
        accentColor="#6366f1"
        items={topSalesExecs}
        metricLabel="Bookings"
        metricKey="bookings"
        avatarBg="#6366f115"
        avatarColor="#6366f1"
      />
      <LeaderboardCard
        title="Top Sourcing Managers"
        icon={Users}
        accentColor="#0ea5e9"
        items={topSourcingManagers}
        metricLabel="Active Brokers"
        metricKey="activeBrokers"
        avatarBg="#0ea5e915"
        avatarColor="#0ea5e9"
      />
      <LeaderboardCard
        title="Top Closing Managers"
        icon={Award}
        accentColor="#10b981"
        items={topClosingManagers}
        metricLabel="Deals Closed"
        metricKey="bookings"
        avatarBg="#10b98115"
        avatarColor="#10b981"
      />
      <LeaderboardCard
        title="Top Brokers"
        icon={Briefcase}
        accentColor="#f59e0b"
        items={topBrokers}
        metricLabel="Bookings"
        metricKey="bookings"
        avatarBg="#f59e0b15"
        avatarColor="#f59e0b"
      />
    </div>
  );
}
