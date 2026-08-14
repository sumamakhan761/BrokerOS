export function CPSalesPipeline({ pipeline }: { pipeline: Record<string, number> }) {
  if (!pipeline) return null;

  const stages = [
    { key: "NEW", label: "New Leads", color: "#3b82f6" },
    { key: "SITE_VISIT_SCHEDULED", label: "Site Visits", color: "#a855f7" },
    { key: "NEGOTIATION", label: "In Negotiation", color: "#f97316" },
    { key: "BOOKED", label: "Booked", color: "#10b981" },
  ];

  // Map other statuses into these buckets if needed
  const pipelineData = {
    NEW: (pipeline["NEW"] || 0) + (pipeline["CONTACTED"] || 0),
    SITE_VISIT_SCHEDULED: (pipeline["SITE_VISIT_SCHEDULED"] || 0) + (pipeline["SITE_VISIT_CONDUCTED"] || 0),
    NEGOTIATION: pipeline["NEGOTIATION"] || 0,
    BOOKED: pipeline["BOOKED"] || 0,
  };

  const total = Object.values(pipelineData).reduce((a, b) => a + b, 0);

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-sm)",
      borderRadius: "var(--radius-xl)",
      padding: 24,
      position: "relative",
      overflow: "hidden",
      transition: "box-shadow 200ms ease",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
    }}
    >
      <h2 style={{
        fontSize: "var(--text-lg)",
        fontWeight: 700,
        color: "var(--text-primary)",
        letterSpacing: "-0.01em",
        marginBottom: 24,
        margin: "0 0 24px 0"
      }}>Sales Pipeline</h2>
      
      {total === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500, margin: 0 }}>No leads in the pipeline yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            display: "flex",
            height: 24,
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)"
          }}>
            {stages.map((stage) => {
              const count = pipelineData[stage.key as keyof typeof pipelineData] || 0;
              const percentage = total > 0 ? (count / total) * 100 : 0;
              if (percentage === 0) return null;
              return (
                <div
                  key={stage.key}
                  style={{
                    background: stage.color,
                    height: "100%",
                    transition: "width 1000ms cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: `${percentage}%`
                  }}
                >
                  {percentage > 10 && <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>{count}</span>}
                </div>
              );
            })}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 16
          }}>
            {stages.map((stage) => {
              const count = pipelineData[stage.key as keyof typeof pipelineData] || 0;
              return (
                <div key={stage.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: stage.color }} />
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>{stage.label}</span>
                  </div>
                  <span style={{
                    fontSize: 24,
                    fontWeight: 900,
                    color: "var(--text-primary)",
                    paddingLeft: 20
                  }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
