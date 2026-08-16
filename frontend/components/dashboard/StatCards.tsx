/* ── Shared StatCards ───────────────────────────────────────────────
   Replaces: DashboardWidgets in pre-sales, sales-exec, PSM, SM,
             post-sales, channel-partner, sourcing-mgr, closing-mgr
   ------------------------------------------------------------------ */
import { LucideIcon } from "lucide-react";

export interface StatCardItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Hex color or CSS var for the icon and accent */
  accent: string;
  /** Optional background tint. Defaults to a 10% opacity of accent */
  bg?: string;
  /** Optional subtitle under the value */
  sub?: string;
}

export function StatCards({
  items,
  cols,
}: {
  items: StatCardItem[];
  /** grid columns override — defaults to auto-fit minmax(200px) */
  cols?: number;
}) {
  const gridStyle: React.CSSProperties = cols
    ? {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 16,
    }
    : {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: 16,
    };

  return (
    <div style={gridStyle}>
      {items.map((item, i) => {
        const Icon = item.icon;
        const bgColor = item.bg ?? item.accent + "12";
        return (
          <div
            key={item.label}
            style={{
              position: "relative",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xl)",
              padding: "20px 22px",
              overflow: "hidden",
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow 200ms cubic-bezier(0.16,1,0.3,1), transform 200ms cubic-bezier(0.16,1,0.3,1)",
              cursor: "default",
              animation: "enter 0.5s cubic-bezier(0.16,1,0.3,1) both",
              animationDelay: `${i * 0.06}s`,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {/* Background accent circle */}
            <div style={{
              position: "absolute",
              top: -16,
              right: -16,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: bgColor,
              pointerEvents: "none",
            }} />

            {/* Icon */}
            <div style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-md)",
              background: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
              position: "relative",
            }}>
              <Icon size={18} strokeWidth={2} style={{ color: item.accent }} />
            </div>

            {/* Value */}
            <div style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              lineHeight: 1,
              marginBottom: 6,
            }}>
              {item.value}
            </div>

            {/* Label */}
            <div style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--text-tertiary)",
              letterSpacing: "-0.01em",
            }}>
              {item.label}
            </div>

            {/* Optional sub */}
            {item.sub && (
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-muted)",
                marginTop: 4,
              }}>
                {item.sub}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
