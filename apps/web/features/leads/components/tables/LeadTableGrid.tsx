import React from "react";
import Link from "next/link";
import {
  StatusPill,
  SkeletonRows,
  EmptyState,
  formatDate,
} from "./TablePrimitives";

interface LeadTableGridProps {
  leads: any[];
  loading: boolean;
  isManagerView?: boolean;
  pathname: string;
}

const TEMP_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  HOT: { bg: "bg-rose-50 border-rose-200", fg: "text-rose-700", icon: "🔥" },
  WARM: { bg: "bg-amber-50 border-amber-200", fg: "text-amber-800", icon: "⚡" },
  COLD: { bg: "bg-sky-50 border-sky-200", fg: "text-sky-700", icon: "❄️" },
};

export function LeadTableGrid({
  leads,
  loading,
  isManagerView,
  pathname,
}: LeadTableGridProps) {
  const colCount = isManagerView ? 9 : 10;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full border-collapse min-w-[900px] text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200/80">
          <tr>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)] w-12 text-center">
              #
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Lead Name
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Phone
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Status
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Temperature
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Assigned Agent
            </th>
            {!isManagerView && (
              <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)] text-center">
                AI Score
              </th>
            )}
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Last Contact
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Next Follow Up
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Site Visit
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : leads.length === 0 ? (
            <EmptyState
              message="No leads found matching your criteria. Try adjusting the search filters."
              colSpan={colCount}
            />
          ) : (
            leads.map((lead, index) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                index={index}
                pathname={pathname}
                isManagerView={isManagerView}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function LeadRow({
  lead,
  index,
  pathname,
  isManagerView,
}: {
  lead: any;
  index: number;
  pathname: string;
  isManagerView?: boolean;
}) {
  const href = `${pathname}/${lead.id}`;
  const temp = lead.temperature as string;
  const tempStyle = TEMP_STYLES[temp] ?? null;

  return (
    <tr className="hover:bg-purple-50/40 transition-colors group cursor-pointer">
      {/* Index */}
      <td className="py-3.5 px-4 text-center font-bold text-[var(--text-muted)] tabular-nums group-hover:text-[var(--brand-700)]">
        <Link href={href} className="block text-inherit text-decoration-none">
          {index + 1}
        </Link>
      </td>

      {/* Name */}
      <td className="py-3.5 px-4">
        <Link href={href} className="block text-decoration-none">
          <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--brand-700)] transition-colors">
            {lead.firstName} {lead.lastName || ""}
          </div>
          {lead.project && (
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              {lead.project}
            </div>
          )}
        </Link>
      </td>

      {/* Phone */}
      <td className="py-3.5 px-4 font-semibold text-[var(--text-secondary)] tabular-nums">
        <Link href={href} className="block text-inherit text-decoration-none">
          {lead.phone || "—"}
        </Link>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        <Link href={href} className="block text-decoration-none">
          <StatusPill status={lead.status} />
        </Link>
      </td>

      {/* Temperature */}
      <td className="py-3.5 px-4">
        <Link href={href} className="block text-decoration-none">
          {tempStyle ? (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${tempStyle.bg} ${tempStyle.fg}`}
            >
              <span>{tempStyle.icon}</span>
              <span>{temp}</span>
            </span>
          ) : (
            <span className="text-slate-300 font-medium">—</span>
          )}
        </Link>
      </td>

      {/* Assigned Agent */}
      <td className="py-3.5 px-4 text-xs font-semibold text-[var(--text-secondary)]">
        <Link href={href} className="block text-inherit text-decoration-none">
          {lead.assignedUser ? (
            lead.assignedUser.name || lead.assignedUser.username
          ) : (
            <span className="text-slate-400 font-normal italic">Unassigned</span>
          )}
        </Link>
      </td>

      {/* AI Score */}
      {!isManagerView && (
        <td className="py-3.5 px-4 text-center">
          <Link href={href} className="block text-decoration-none">
            {lead.score !== null && lead.score !== undefined ? (
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums border ${lead.score >= 80
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : lead.score >= 60
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
              >
                {lead.score}
              </span>
            ) : (
              <span className="text-slate-300 font-medium">—</span>
            )}
          </Link>
        </td>
      )}

      {/* Last Contact */}
      <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] tabular-nums">
        <Link href={href} className="block text-inherit text-decoration-none">
          {formatDate(lead.lastContactDate)}
        </Link>
      </td>

      {/* Next Follow Up */}
      <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] tabular-nums">
        <Link href={href} className="block text-inherit text-decoration-none">
          {formatDate(lead.nextFollowUpDate)}
        </Link>
      </td>

      {/* Site Visit */}
      <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] tabular-nums">
        <Link href={href} className="block text-inherit text-decoration-none">
          {lead.latestSiteVisit
            ? formatDate(lead.latestSiteVisit.scheduledDate)
            : "—"}
        </Link>
      </td>
    </tr>
  );
}
