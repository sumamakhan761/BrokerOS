/* ── Shared FollowUpList ────────────────────────────────────────────
   Replaces: pre-sales/components/TodayFollowUps.tsx
             pre-sales-manager/_components/TodayFollowUps.tsx
             post-sales/components/PostSalesFollowUps.tsx
   ------------------------------------------------------------------ */
"use client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Avatar } from "./Avatar";

export interface FollowUpItem {
  id: string;
  status: string;
  scheduledDate?: string;
  lead?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    status?: string;
    temperature?: string;
    phone?: string;
  };
  customer?: {
    id?: string;
    firstName?: string;
    lastName?: string;
  };
}

const TEMP_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  HOT:  { bg: "#fee2e2", text: "#b91c1c", label: "Hot" },
  WARM: { bg: "#fef3c7", text: "#b45309", label: "Warm" },
  COLD: { bg: "#dbeafe", text: "#1e40af", label: "Cold" },
};

export function FollowUpList({
  items,
  onConfirm,
  viewAllHref,
  title = "Today's Follow-ups",
}: {
  items: FollowUpItem[];
  onConfirm?: (id: string) => void;
  viewAllHref?: string;
  title?: string;
}) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
      }}>
        <div style={{
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}>
          {title}
        </div>
        <span style={{
          padding: "3px 10px",
          borderRadius: "var(--radius-full)",
          background: "var(--success-bg)",
          color: "var(--success-fg)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          border: "1px solid #bbf7d0",
        }}>
          Today
        </span>
      </div>

      {/* Body */}
      {!items || items.length === 0 ? (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          fontWeight: 500,
        }}>
          No follow-ups scheduled for today.
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {items.map((fu, i) => {
            const name = fu.lead
              ? `${fu.lead.firstName ?? ""} ${fu.lead.lastName ?? ""}`.trim()
              : fu.customer
              ? `${fu.customer.firstName ?? ""} ${fu.customer.lastName ?? ""}`.trim()
              : "Unknown";
            const temp = fu.lead?.temperature;
            const tempStyle = temp ? TEMP_COLORS[temp] : null;
            const isActionable = ["SCHEDULED", "RESCHEDULED", "MISSED"].includes(fu.status);

            return (
              <div
                key={fu.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < items.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  transition: "background 150ms ease",
                }}
              >
                {/* Left: avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <Avatar name={name.split(" ")[0]} size={34} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {name || "—"}
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}>
                      {fu.lead?.status ?? fu.lead?.phone ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Right: temp badge + confirm/done */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {tempStyle && (
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "var(--radius-full)",
                      background: tempStyle.bg,
                      color: tempStyle.text,
                      fontSize: 10,
                      fontWeight: 700,
                    }}>
                      {tempStyle.label}
                    </span>
                  )}
                  {onConfirm && isActionable ? (
                    <button
                      onClick={() => onConfirm(fu.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--success-bg)",
                        border: "1px solid #a7f3d0",
                        color: "var(--success-fg)",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "background 150ms ease",
                      }}
                    >
                      <CheckCircle size={12} />
                      Confirm
                    </button>
                  ) : (
                    <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--success-fg)",
                    }}>
                      <CheckCircle size={13} /> Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer link */}
      {viewAllHref && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
          <Link
            href={viewAllHref}
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "var(--brand-600)",
              background: "var(--brand-50)",
              padding: "10px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              transition: "background 150ms ease",
              border: "1px solid var(--brand-100)",
            }}
          >
            See all follow-ups →
          </Link>
        </div>
      )}
    </div>
  );
}
