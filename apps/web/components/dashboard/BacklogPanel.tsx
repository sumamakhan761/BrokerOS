/* ── Shared BacklogPanel ────────────────────────────────────────────
   Replaces: pre-sales/components/Backlogs.tsx
             pre-sales-manager/_components/TeamBacklogs.tsx
             sales-manager/_components/TeamBacklogs.tsx (partial)
   ------------------------------------------------------------------ */
import { CheckCircle2, PhoneMissed, CalendarClock } from "lucide-react";

export interface MissedFollowUp {
  id: string;
  scheduledDate: string;
  lead?: { firstName?: string; lastName?: string };
  customer?: { firstName?: string; lastName?: string };
}

export function BacklogPanel({
  coldCallBacklogCount = 0,
  missedFollowUps = [],
}: {
  coldCallBacklogCount?: number;
  missedFollowUps?: MissedFollowUp[];
}) {
  const hasBacklog = coldCallBacklogCount > 0 || missedFollowUps.length > 0;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: `1px solid ${hasBacklog ? "#fca5a5" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-xl)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
      transition: "border-color 200ms ease",
    }}>
      <div style={{
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: hasBacklog ? "var(--danger-fg)" : "var(--text-primary)",
        letterSpacing: "-0.01em",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}>
        Backlogs
      </div>

      {!hasBacklog ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 0",
          gap: 10,
        }}>
          <CheckCircle2 size={40} style={{ color: "#4ade80" }} />
          <span style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--text-muted)",
          }}>
            All caught up! No backlogs.
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Cold call backlog */}
          {coldCallBacklogCount > 0 && (
            <div style={{
              background: "var(--danger-bg)",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-lg)",
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PhoneMissed size={15} style={{ color: "var(--danger-fg)" }} />
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#991b1b" }}>
                    Cold Call Backlog
                  </span>
                </div>
                <span style={{
                  background: "#fecaca",
                  color: "#991b1b",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                  {coldCallBacklogCount}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--danger-fg)", marginTop: 6, marginBottom: 0, fontWeight: 500 }}>
                Call {coldCallBacklogCount} new lead{coldCallBacklogCount > 1 ? "s" : ""} to clear
              </p>
            </div>
          )}

          {/* Missed follow-ups */}
          {missedFollowUps.length > 0 && (
            <div style={{
              background: "var(--warning-bg)",
              border: "1px solid #fde68a",
              borderRadius: "var(--radius-lg)",
              padding: "14px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CalendarClock size={15} style={{ color: "var(--warning-fg)" }} />
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "#92400e" }}>
                    Missed Follow-ups
                  </span>
                </div>
                <span style={{
                  background: "#fde68a",
                  color: "#92400e",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                  {missedFollowUps.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 160, overflowY: "auto" }}>
                {missedFollowUps.slice(0, 6).map(fu => {
                  const firstName = fu.lead?.firstName ?? fu.customer?.firstName ?? "";
                  const lastName = fu.lead?.lastName ?? fu.customer?.lastName ?? "";
                  const name = `${firstName} ${lastName}`.trim() || "—";
                  return (
                    <div key={fu.id} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      paddingBottom: 6,
                      borderBottom: "1px solid #fde68a50",
                    }}>
                      <span style={{ fontWeight: 600, color: "#b45309", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {name}
                      </span>
                      <span style={{ color: "#d97706", flexShrink: 0, marginLeft: 8, fontWeight: 500 }}>
                        {new Date(fu.scheduledDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
