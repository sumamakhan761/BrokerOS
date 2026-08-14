/* ── Shared Leaderboard ─────────────────────────────────────────────
   Replaces: pre-sales/components/MonthlyLeaderboard.tsx
             sales-executive/components/MonthlyLeaderboard.tsx
             pre-sales-manager/_components/Leaderboard.tsx
             sales-manager/_components/TeamLeaderboard.tsx
             sourcing-manager/components/BrokerLeaderboard.tsx
   ------------------------------------------------------------------ */
import { Avatar } from "./Avatar";

export interface LeaderboardColumn {
  key: string;
  label: string;
  /** optional formatter */
  format?: (val: any) => string | number;
}

export interface LeaderboardEntry {
  id?: string;
  userId?: string;
  name: string;
  rank?: number;
  score?: number | string;
  image?: string;
  [key: string]: any;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_BG: Record<number, string> = {
  1: "rgba(251,191,36,0.1)",
  2: "rgba(148,163,184,0.1)",
  3: "rgba(251,146,60,0.1)",
};

export function Leaderboard({
  title = "Monthly Leaderboard",
  entries,
  columns,
  currentUserId,
  accentColor = "var(--brand-600)",
  maxHeight = 420,
}: {
  title?: string;
  entries: LeaderboardEntry[];
  columns: LeaderboardColumn[];
  currentUserId?: string;
  accentColor?: string;
  maxHeight?: number;
}) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-xl)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Title */}
      <div style={{
        fontSize: "var(--text-sm)",
        fontWeight: 700,
        color: "var(--text-primary)",
        letterSpacing: "-0.01em",
        marginBottom: 16,
      }}>
        {title}
      </div>

      {/* Header row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "0 10px 10px",
        borderBottom: "1px solid var(--border-subtle)",
        marginBottom: 6,
      }}>
        <div style={{ width: 36, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Rank
        </div>
        <div style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Name
        </div>
        {columns.map(col => (
          <div key={col.key} style={{
            width: 56,
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            textAlign: "right",
          }}>
            {col.label}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        maxHeight,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
        {(!entries || entries.length === 0) ? (
          <div style={{
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "var(--text-sm)",
            padding: "32px 0",
          }}>
            No entries yet.
          </div>
        ) : entries.map((entry, idx) => {
          const rank = entry.rank ?? idx + 1;
          const isMe = !!currentUserId && (entry.userId === currentUserId || entry.id === currentUserId);
          const rankLabel = rank <= 3 ? RANK_MEDALS[rank - 1] : `${rank}`;
          const rowBg = isMe
            ? "rgba(124,58,237,0.06)"
            : RANK_BG[rank] ?? "transparent";

          return (
            <div
              key={entry.userId ?? entry.id ?? idx}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "9px 10px",
                borderRadius: "var(--radius-md)",
                background: rowBg,
                outline: isMe ? "1px solid rgba(124,58,237,0.15)" : "none",
                transition: "background 150ms ease",
              }}
              onMouseEnter={e => {
                if (!RANK_BG[rank] && !isMe)
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-subtle)";
              }}
              onMouseLeave={e => {
                if (!RANK_BG[rank] && !isMe)
                  (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {/* Rank */}
              <div style={{ width: 36, fontSize: 16, fontWeight: 700, color: "var(--text-secondary)" }}>
                {rankLabel}
              </div>

              {/* Name + Avatar */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <Avatar name={entry.name} image={entry.image} size={28} />
                <span style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: isMe ? 700 : 600,
                  color: isMe ? accentColor : "var(--text-secondary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {entry.name || "—"}
                  {isMe && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: accentColor, marginLeft: 6, opacity: 0.7 }}>
                      You
                    </span>
                  )}
                </span>
              </div>

              {/* Data columns */}
              {columns.map(col => (
                <div key={col.key} style={{
                  width: 56,
                  fontSize: "var(--text-sm)",
                  fontWeight: col.key === "score" ? 800 : 600,
                  color: col.key === "score"
                    ? (isMe ? accentColor : "var(--text-primary)")
                    : "var(--text-tertiary)",
                  textAlign: "right",
                }}>
                  {col.format ? col.format(entry[col.key]) : (entry[col.key] ?? "—")}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
