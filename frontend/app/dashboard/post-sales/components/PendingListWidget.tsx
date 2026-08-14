import Link from "next/link";
import { LeadListItem } from "../types";
import { Avatar } from "@/components/dashboard/Avatar";

interface PendingListWidgetProps {
  title: string;
  list: LeadListItem[];
  statusFilter: string;
  emptyMessage?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DOCUMENT: { bg: "#fef3c7", text: "#d97706" },
  LOAN: { bg: "#dbeafe", text: "#2563eb" },
  AGREEMENT: { bg: "#f3e8ff", text: "#9333ea" },
  HANDOVER: { bg: "#fce7f3", text: "#db2777" },
};

export function PendingListWidget({ title, list, statusFilter, emptyMessage = "No pending items." }: PendingListWidgetProps) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-sm)",
      borderRadius: "var(--radius-xl)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          margin: 0
        }}>
          {title}
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--text-sm)",
          color: "var(--text-muted)",
          fontWeight: 500,
        }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
          {list.map((lead, i) => {
            const badgeStyle = STATUS_COLORS[lead.status] || { bg: "var(--bg-subtle)", text: "var(--text-secondary)" };
            return (
              <Link href={`/dashboard/post-sales/lead-management/${lead.id}`} key={lead.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 8px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                borderBottom: i < list.length - 1 ? "1px solid var(--border-subtle)" : "none",
                textDecoration: "none",
                transition: "background 150ms ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <Avatar name={lead.firstName} size={34} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {`${lead.firstName} ${lead.lastName || ""}`.trim()}
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      marginTop: 2
                    }}>
                      {lead.phone || "No phone number"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    background: badgeStyle.bg,
                    color: badgeStyle.text,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {lead.subStatus && lead.status === 'HANDOVER' ? lead.subStatus : lead.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
        <Link href={`/dashboard/post-sales/lead-management?status=${statusFilter}`} style={{
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
        }}>
          See all {title.toLowerCase()} →
        </Link>
      </div>
    </div>
  );
}
