/* ── Shared LiveMapCard ─────────────────────────────────────────────
   Wraps LiveTrackingMap in a consistently styled card.
   Replaces: Inline map sections in sales-executive/page.tsx
             Inline map section in sourcing-manager/page.tsx
   ------------------------------------------------------------------ */
"use client";
import { MapPin } from "lucide-react";
import LiveTrackingMap from "@/components/LiveTrackingMap";

export function LiveMapCard({ userId, title = "My Live Location", subtitle }: {
  userId: string | null | undefined;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Card header */}
      <div style={{
        padding: "18px 24px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background: "var(--info-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <MapPin size={16} style={{ color: "var(--info-fg)" }} />
          </div>
          <div>
            <div style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-muted)",
                marginTop: 2,
              }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {/* Live badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 12px",
          borderRadius: "var(--radius-full)",
          background: "var(--success-bg)",
          border: "1px solid #bbf7d0",
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#16a34a",
            animation: "pulse-live 2s ease infinite",
          }} />
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--success-fg)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Live
          </span>
        </div>
      </div>

      {/* Map area */}
      <div style={{ padding: 20 }}>
        {userId ? (
          <LiveTrackingMap userId={userId} />
        ) : (
          <div style={{
            height: 380,
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            border: "1px dashed var(--border-default)",
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: "var(--text-muted)",
              animation: "dash-spin 0.75s linear infinite",
            }} />
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", fontWeight: 500 }}>
              Loading map…
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes dash-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
