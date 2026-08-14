/* ── Shared PipelineBar ─────────────────────────────────────────────
   Replaces: pre-sales/components/PipelineStages.tsx
             pre-sales-manager/_components/PipelineDistribution.tsx
             sales-manager/_components/PipelineDistribution.tsx
   ------------------------------------------------------------------ */
import { BarChart3 } from "lucide-react";

export interface PipelineStage {
  key: string;
  label: string;
  color: string;
}

export function PipelineBar({
  title = "Pipeline Stages",
  stages,
  data,
}: {
  title?: string;
  stages: PipelineStage[];
  data: Record<string, number>;
}) {
  const values = Object.values(data);
  const max = values.length > 0 ? Math.max(1, ...values) : 1;

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      padding: "24px 24px",
      boxShadow: "var(--shadow-sm)",
      height: "100%",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
      }}>
        <BarChart3 size={15} style={{ color: "var(--brand-500)", flexShrink: 0 }} />
        <h2 style={{
          margin: 0,
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}>
          {title}
        </h2>
      </div>

      {/* Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {stages.map((stage) => {
          const count = data[stage.key] ?? 0;
          const pct = Math.round((count / max) * 100);
          return (
            <div key={stage.key}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}>
                <span style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  letterSpacing: "-0.01em",
                }}>
                  {stage.label}
                </span>
                <span style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}>
                  {count}
                </span>
              </div>
              <div style={{
                height: 7,
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-full)",
                overflow: "hidden",
              }}>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: "var(--radius-full)",
                    background: stage.color,
                    transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
