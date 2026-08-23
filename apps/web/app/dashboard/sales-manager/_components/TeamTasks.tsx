import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { DashboardData } from "./types";
import Link from "next/link";
// Using native JS Date formatting instead of date-fns

export function TeamTasks({ data }: { data: DashboardData }) {
  const { todaySiteVisitList, todayFollowUpList } = data;

  return (
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
      <h2 style={{
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
        <Calendar size={20} style={{ color: "var(--brand-500)" }} />
        Today's Tasks (Team)
      </h2>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        flex: 1,
        overflowY: "auto",
        paddingRight: 8
      }} className="custom-scrollbar">
        <div>
          <h3 style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: 16,
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: 8,
            margin: "0 0 16px 0"
          }}>Site Visits</h3>
          {todaySiteVisitList.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>No site visits scheduled for today.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {todaySiteVisitList.map((sv) => (
                <Link
                  href={`/dashboard/sales-manager/lead-management/${sv.lead?.id}`}
                  key={sv.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-subtle)",
                    textDecoration: "none",
                    transition: "background 150ms ease, border-color 150ms ease"
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}>
                      {sv.lead?.firstName} {sv.lead?.lastName}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                        background: "var(--border-subtle)",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-sm)"
                      }}>
                        {sv.salesExec?.name}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                        {sv.project?.name || "No Project"}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--brand-600)" }}>
                      {new Date(sv.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p style={{ margin: 0, marginTop: 4, fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      {sv.status.replace(/_/g, " ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 style={{
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            color: "var(--text-secondary)",
            marginBottom: 16,
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: 8,
            margin: "0 0 16px 0"
          }}>Follow-ups</h3>
          {todayFollowUpList.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>No follow-ups scheduled for today.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {todayFollowUpList.map((fup) => (
                <Link
                  href={`/dashboard/sales-manager/lead-management/${fup.lead?.id}`}
                  key={fup.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-subtle)",
                    textDecoration: "none",
                    transition: "background 150ms ease, border-color 150ms ease"
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}>
                      {fup.lead?.firstName} {fup.lead?.lastName}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <span style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        fontWeight: 800,
                        color: "var(--text-secondary)",
                        background: "var(--border-subtle)",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-sm)"
                      }}>
                        {fup.user?.name}
                      </span>
                      <span style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        background: fup.lead?.temperature === 'HOT' ? "#fee2e2" : fup.lead?.temperature === 'WARM' ? "#ffedd5" : "#e0f2fe",
                        color: fup.lead?.temperature === 'HOT' ? "#b91c1c" : fup.lead?.temperature === 'WARM' ? "#c2410c" : "#0369a1"
                      }}>
                        {fup.lead?.temperature}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--brand-600)" }}>
                      {new Date(fup.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {fup.status === 'COMPLETED' ? (
                      <CheckCircle2 size={16} style={{ color: "#10b981", marginTop: 4 }} />
                    ) : (
                      <Clock size={16} style={{ color: "#f59e0b", marginTop: 4 }} />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
