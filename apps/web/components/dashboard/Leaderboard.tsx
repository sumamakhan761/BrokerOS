import React from "react";
import { Avatar } from "./Avatar";
import { Trophy } from "lucide-react";

export interface LeaderboardColumn {
  key: string;
  label: string;
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
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} className="text-amber-500 flex-shrink-0" />
        <div className="text-xs font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex items-center px-3 pb-2.5 border-b border-slate-100 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
        <div className="w-9">Rank</div>
        <div className="flex-1">Member</div>
        {columns.map((col) => (
          <div key={col.key} className="w-14 text-right">
            {col.label}
          </div>
        ))}
      </div>

      {/* Row List */}
      <div
        className="flex-1 space-y-1 overflow-y-auto pr-1"
        style={{ maxHeight }}
      >
        {!entries || entries.length === 0 ? (
          <div className="text-center text-xs font-medium text-[var(--text-muted)] py-8">
            No leaderboard entries recorded yet.
          </div>
        ) : (
          entries.map((entry, idx) => {
            const rank = entry.rank ?? idx + 1;
            const isMe =
              !!currentUserId &&
              (entry.userId === currentUserId || entry.id === currentUserId);
            const rankLabel = rank <= 3 ? RANK_MEDALS[rank - 1] : `#${rank}`;

            return (
              <div
                key={entry.userId ?? entry.id ?? idx}
                className={`flex items-center px-3 py-2 rounded-xl text-xs transition-colors ${
                  isMe
                    ? "bg-purple-50/80 border border-purple-200/80 font-bold"
                    : rank <= 3
                    ? "bg-slate-50/80 hover:bg-slate-100/70"
                    : "hover:bg-slate-50"
                }`}
              >
                {/* Rank */}
                <div className="w-9 font-extrabold text-[var(--text-secondary)] tabular-nums">
                  {rankLabel}
                </div>

                {/* Avatar + Name */}
                <div className="flex-1 flex items-center gap-2.5 min-w-0 pr-2">
                  <Avatar name={entry.name} image={entry.image} size={26} />
                  <span className="truncate font-semibold text-[var(--text-primary)]">
                    {entry.name || "—"}
                    {isMe && (
                      <span className="ml-1.5 text-[10px] uppercase font-bold text-[var(--brand-700)] bg-purple-100 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </span>
                </div>

                {/* Data Columns */}
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`w-14 text-right tabular-nums ${
                      col.key === "score"
                        ? "font-extrabold text-[var(--brand-700)]"
                        : "font-semibold text-[var(--text-secondary)]"
                    }`}
                  >
                    {col.format ? col.format(entry[col.key]) : entry[col.key] ?? "—"}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
