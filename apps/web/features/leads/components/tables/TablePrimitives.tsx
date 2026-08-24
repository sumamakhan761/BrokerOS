import React from "react";

/* ─── Shared Date Formatter ────────────────────────────────────────── */
export function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ─── Semantic OKLCH Status Colors ─────────────────────────────────── */
export const STATUS_COLORS: Record<
  string,
  { bg: string; fg: string; border: string }
> = {
  NEW: {
    bg: "bg-purple-50",
    fg: "text-purple-700",
    border: "border-purple-200",
  },
  CONTACTED: {
    bg: "bg-sky-50",
    fg: "text-sky-700",
    border: "border-sky-200",
  },
  INTERESTED: {
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
    border: "border-emerald-200",
  },
  QUALIFIED: {
    bg: "bg-teal-50",
    fg: "text-teal-700",
    border: "border-teal-200",
  },
  SITE_VISIT_SCHEDULED: {
    bg: "bg-amber-50",
    fg: "text-amber-800",
    border: "border-amber-200",
  },
  SITE_VISIT_COMPLETED: {
    bg: "bg-indigo-50",
    fg: "text-indigo-700",
    border: "border-indigo-200",
  },
  NEGOTIATION: {
    bg: "bg-orange-50",
    fg: "text-orange-800",
    border: "border-orange-200",
  },
  BOOKING: {
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
    border: "border-emerald-200",
  },
  DOCUMENT: {
    bg: "bg-amber-50",
    fg: "text-amber-900",
    border: "border-amber-300",
  },
  LOAN: {
    bg: "bg-blue-50",
    fg: "text-blue-700",
    border: "border-blue-200",
  },
  AGREEMENT: {
    bg: "bg-violet-50",
    fg: "text-violet-700",
    border: "border-violet-200",
  },
  HANDOVER: {
    bg: "bg-rose-50",
    fg: "text-rose-700",
    border: "border-rose-200",
  },
  LOST: {
    bg: "bg-rose-50",
    fg: "text-rose-700",
    border: "border-rose-200",
  },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? {
    bg: "bg-slate-50",
    fg: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.bg} ${s.fg} ${s.border} whitespace-nowrap select-none`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 inline-block" />
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* Shimmer skeleton row for table loading state */
export function SkeletonRows({
  cols,
  rows = 5,
}: {
  cols: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 last:border-none">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div
                className="h-3.5 rounded-md bg-slate-100 animate-pulse"
                style={{
                  width: j === 0 ? "35%" : j === 1 ? "65%" : "50%",
                  opacity: 1 - i * 0.12,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* Empty state */
export function EmptyState({
  message,
  colSpan,
}: {
  message: string;
  colSpan: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-14 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/80">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 10h20" />
              <path d="M7 15h4" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-[var(--text-muted)] max-w-sm m-0">
            {message}
          </p>
        </div>
      </td>
    </tr>
  );
}

/* Premium table CSS properties */
export const tableHeaderStyle: React.CSSProperties = {
  background: "var(--bg-subtle)",
  borderBottom: "1px solid var(--border-default)",
};

export const thStyle: React.CSSProperties = {
  padding: "11px 16px",
  fontSize: 10,
  fontWeight: 800,
  color: "var(--text-muted)",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  textAlign: "left",
};

export const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-2xl)",
  boxShadow: "var(--shadow-xs)",
};
