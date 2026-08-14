import { Award, Building2, Users } from "lucide-react";

export function CPLeaderboards({ leaderboards }: { leaderboards: any }) {
  if (!leaderboards) return null;

  const { topProjects = [], topClosingManagers = [], topSourcingManagers = [], topBrokers = [] } = leaderboards;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginTop: 32
    }}>
      {/* Column 1: Top Projects & Top Brokers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Top Projects */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
          borderRadius: "var(--radius-xl)",
          padding: 24,
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
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={20} style={{ color: "var(--brand-500)" }} /> Top Projects
            </span>
          </h2>

          {topProjects.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: 0 }}>No project data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topProjects.map((proj: any, idx: number) => {
                const colors = [
                  { bg: "#fef9c3", text: "#a16207" },
                  { bg: "#f1f5f9", text: "#475569" },
                  { bg: "#ffedd5", text: "#c2410c" },
                  { bg: "#eff6ff", text: "#1d4ed8" }
                ];
                const color = colors[Math.min(idx, 3)];
                return (
                  <div key={proj.id} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid transparent",
                    transition: "background 150ms ease, border-color 150ms ease",
                    cursor: "default"
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        background: color.bg,
                        color: color.text,
                        fontSize: 12
                      }}>
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 style={{
                          margin: 0,
                          fontSize: "var(--text-sm)",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}>{proj.name}</h3>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--text-primary)" }}>{proj.bookings}</p>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em" }}>BOOKINGS</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Brokers */}
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-sm)",
          borderRadius: "var(--radius-xl)",
          padding: 24,
        }}>
          <h2 style={{
            fontSize: 12,
            fontWeight: 800,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "0 0 16px 0"
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} /> Top Brokers
            </span>
          </h2>
          {topBrokers.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: 0 }}>No broker data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topBrokers.map((broker: any, idx: number) => (
                <div key={broker.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: "var(--brand-100)",
                      color: "var(--brand-700)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 12
                    }}>
                      {broker.name?.[0] || 'B'}
                    </div>
                    <h3 style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-secondary)" }}>{broker.name}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 900, color: "var(--text-primary)" }}>
                      {broker.bookings} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>deals</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Internal Managers */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        height: "100%"
      }}>
        <h2 style={{
          fontSize: "var(--text-lg)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: 0
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={20} style={{ color: "var(--brand-500)" }} /> Top Internal Teams
          </span>
        </h2>

        {/* Top Sourcing Managers */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: 12,
            fontWeight: 800,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "0 0 16px 0"
          }}>
            Top Sourcing Managers
          </h2>
          {topSourcingManagers.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: 0 }}>No sourcing manager data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topSourcingManagers.map((sm: any, idx: number) => (
                <div key={sm.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: "#d1fae5",
                      color: "#059669",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 12
                    }}>
                      {sm.name?.[0] || 'S'}
                    </div>
                    <h3 style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-secondary)" }}>{sm.name}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 900, color: "var(--text-primary)" }}>
                      {sm.bookings} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>broker deals</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Closing Managers */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: 12,
            fontWeight: 800,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "0 0 16px 0"
          }}>
            Top Closing Managers
          </h2>
          {topClosingManagers.length === 0 ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", margin: 0 }}>No closing manager data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topClosingManagers.map((cm: any, idx: number) => (
                <div key={cm.id} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 12,
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: "#dbeafe",
                      color: "#2563eb",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 12
                    }}>
                      {cm.name?.[0] || 'C'}
                    </div>
                    <h3 style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-secondary)" }}>{cm.name}</h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 900, color: "var(--text-primary)" }}>
                      {cm.bookings} <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>units sold</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
