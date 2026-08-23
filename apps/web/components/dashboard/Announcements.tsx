/* ── Shared Announcements ───────────────────────────────────────────
   Replaces: pre-sales/components/Announcements.tsx
   ------------------------------------------------------------------ */
import { Megaphone } from "lucide-react";

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export function Announcements({ announcements }: { announcements: AnnouncementItem[] }) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {announcements.map((ann, i) => (
        <div
          key={ann.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            padding: "14px 18px",
            borderRadius: "var(--radius-lg)",
            background: "var(--warning-bg)",
            border: "1px solid #fde68a",
            borderLeft: "4px solid #f59e0b",
            animation: `enter 0.5s cubic-bezier(0.16,1,0.3,1) both`,
            animationDelay: `${i * 0.07}s`,
          }}
        >
          <Megaphone
            size={16}
            style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              color: "#92400e",
              marginBottom: 3,
              letterSpacing: "-0.01em",
            }}>
              {ann.title}
            </div>
            <div style={{
              fontSize: "var(--text-sm)",
              color: "#b45309",
              lineHeight: 1.55,
            }}>
              {ann.description}
            </div>
          </div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#d97706",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}>
            {new Date(ann.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
          </div>
        </div>
      ))}
    </div>
  );
}
