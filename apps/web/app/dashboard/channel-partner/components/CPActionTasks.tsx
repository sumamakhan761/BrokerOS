import { Calendar, PhoneCall, AlertCircle, ArrowRight, Key } from "lucide-react";
import Link from "next/link";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

export function CPActionTasks({ tasks }: { tasks: any[] }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
      }}>
        <div style={{
          width: 64,
          height: 64,
          background: "var(--bg-subtle)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16
        }}>
          <AlertCircle size={32} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
        </div>
        <h3 style={{
          fontSize: "var(--text-lg)",
          fontWeight: 800,
          color: "var(--text-primary)",
          margin: 0
        }}>All Caught Up!</h3>
        <p style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-secondary)",
          textAlign: "center",
          marginTop: 8,
          marginBottom: 0
        }}>No pending follow-ups, site visits, or handovers in your broker network.</p>
      </div>
    );
  }

  const getIconData = (type: string) => {
    switch (type) {
      case 'SITE_VISIT': return { icon: Calendar, color: "#2563eb", bg: "#eff6ff" };
      case 'FOLLOW_UP': return { icon: PhoneCall, color: "#d97706", bg: "#fffbeb" };
      case 'HANDOVER': return { icon: Key, color: "#059669", bg: "#ecfdf5" };
      default: return { icon: AlertCircle, color: "var(--text-secondary)", bg: "var(--bg-subtle)" };
    }
  };

  return (
    <div style={{
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-xl)",
      padding: 24,
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-sm)",
      height: "100%",
    }}>
      <h2 style={{
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-primary)",
        letterSpacing: "-0.01em",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "0 0 24px 0"
      }}>
        <span>Broker Network Action Feed</span>
        <span style={{
          background: "var(--brand-50)",
          color: "var(--brand-600)",
          fontSize: 11,
          fontWeight: 800,
          padding: "4px 12px",
          borderRadius: "var(--radius-full)",
        }}>
          {tasks.length} Pending
        </span>
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16
      }}>
        {tasks.map((task) => {
          const { icon: Icon, color, bg } = getIconData(task.type);
          const linkHref = task.leadId 
            ? `/dashboard/channel-partner/customer-management/${task.leadId}`
            : task.brokerId 
              ? `/dashboard/channel-partner/broker-management/${task.brokerId}` 
              : "#";
          return (
            <div key={task.id} style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: 16,
              borderRadius: "var(--radius-lg)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-xs)",
              transition: "transform 200ms ease, box-shadow 200ms ease",
              cursor: "pointer"
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-xs)";
            }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: bg
                }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: "var(--text-sm)",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}>{task.title}</span>
                  <span style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    marginTop: 4
                  }}>
                    {formatDate(task.date)}
                  </span>
                  {task.metadata && task.metadata.project && (
                    <span style={{
                      fontSize: 10,
                      color: "var(--brand-600)",
                      fontWeight: 800,
                      marginTop: 6,
                      background: "var(--brand-50)",
                      width: "fit-content",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-sm)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      {task.metadata.project}
                    </span>
                  )}
                </div>
              </div>
              <Link href={linkHref} style={{
                padding: 8,
                borderRadius: "var(--radius-md)",
                background: "var(--bg-subtle)",
                color: "var(--text-secondary)",
                transition: "background 150ms ease, color 150ms ease",
                flexShrink: 0,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = color;
                (e.currentTarget as HTMLElement).style.color = "#fff";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              }}
              >
                <ArrowRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
