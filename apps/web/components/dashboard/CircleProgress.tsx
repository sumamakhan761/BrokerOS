/* ── Shared CircleProgress ──────────────────────────────────────────
   Replaces: pre-sales/components/CircleProgress.tsx
   ------------------------------------------------------------------ */

export function CircleProgress({
  done,
  target,
  label,
  color = "var(--brand-600)",
}: {
  done: number;
  target: number;
  label: string;
  color?: string;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = target === 0 ? 0 : Math.min(100, Math.round((done / target) * 100));
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={48} cy={48} r={r}
            fill="none"
            stroke="var(--bg-subtle)"
            strokeWidth={8}
          />
          <circle
            cx={48} cy={48} r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            {pct}%
          </span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: "var(--text-sm)",
          fontWeight: 650,
          color: "var(--text-secondary)",
          letterSpacing: "-0.01em",
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-muted)",
          marginTop: 2,
        }}>
          {done} / {target}
        </div>
      </div>
    </div>
  );
}
