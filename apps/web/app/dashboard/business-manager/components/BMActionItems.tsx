"use client";

import {
  AlertTriangle,
  CreditCard,
  Clock,
  ChevronRight,
  CheckCircle2,
  Info,
} from "lucide-react";

type ActionSeverity = "CRITICAL" | "WARNING" | "INFO";
type ActionType = "PENDING_APPROVAL" | "OVERDUE_PAYMENT" | "HIGH_BACKLOG";

interface ActionItem {
  id: string;
  type: ActionType;
  title: string;
  description: string;
  severity: ActionSeverity;
  date: string;
  meta: Record<string, any>;
}

const severityConfig: Record<
  ActionSeverity,
  { icon: any; bg: string; iconColor: string; border: string; badge: string; badgeBg: string }
> = {
  CRITICAL: {
    icon: AlertTriangle,
    bg: "#fff1f2",
    iconColor: "#e11d48",
    border: "#fecdd3",
    badge: "CRITICAL",
    badgeBg: "#fecdd3",
  },
  WARNING: {
    icon: Clock,
    bg: "#fffbeb",
    iconColor: "#d97706",
    border: "#fde68a",
    badge: "ACTION NEEDED",
    badgeBg: "#fde68a",
  },
  INFO: {
    icon: Info,
    bg: "#f0f9ff",
    iconColor: "#0284c7",
    border: "#bae6fd",
    badge: "INFO",
    badgeBg: "#bae6fd",
  },
};

const typeIcons: Record<ActionType, any> = {
  PENDING_APPROVAL: CheckCircle2,
  OVERDUE_PAYMENT: CreditCard,
  HIGH_BACKLOG: Clock,
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function BMActionItems({ actionItems }: { actionItems: ActionItem[] }) {
  if (!actionItems || actionItems.length === 0) return null;

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-md)",
              background: "#e11d4815",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={16} style={{ color: "#e11d48" }} />
          </div>
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
              Action Required
            </h2>
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
              {actionItems.length} item{actionItems.length !== 1 ? "s" : ""} need attention
            </p>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {actionItems.map((item, i) => {
          const cfg = severityConfig[item.severity] || severityConfig.INFO;
          const SevIcon = cfg.icon;
          const TypeIcon = typeIcons[item.type] || Info;

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 16px",
                borderRadius: "var(--radius-lg)",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                animation: `enter 0.4s cubic-bezier(0.16,1,0.3,1) both`,
                animationDelay: `${i * 0.06}s`,
                cursor: "default",
                transition: "opacity 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.88";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: `${cfg.iconColor}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <SevIcon size={16} style={{ color: cfg.iconColor }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.title}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      color: cfg.iconColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      background: cfg.badgeBg,
                      padding: "2px 7px",
                      borderRadius: 999,
                    }}
                  >
                    {cfg.badge}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                >
                  {item.description}
                </p>
              </div>

              {/* Time */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {timeAgo(item.date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
