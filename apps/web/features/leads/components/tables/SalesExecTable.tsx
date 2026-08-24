import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  StatusPill,
  SkeletonRows,
  EmptyState,
  formatDate,
} from "./TablePrimitives";

interface SalesExecTableProps {
  filteredLeads: any[];
  loading: boolean;
  isManagerView?: boolean;
}

export function SalesExecTable({
  filteredLeads,
  loading,
  isManagerView,
}: SalesExecTableProps) {
  const pathname = usePathname();
  const colCount = isManagerView ? 8 : 7;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full border-collapse min-w-[900px] text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200/80">
          <tr>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)] w-12 text-center">
              #
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Prospect
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Phone
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Status
            </th>
            {isManagerView && (
              <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                Assigned Agent
              </th>
            )}
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              SV Scheduled
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              SV Completed
            </th>
            {!isManagerView && (
              <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
                Last Contact
              </th>
            )}
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Next Follow-Up
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : filteredLeads.length === 0 ? (
            <EmptyState
              message="No leads found matching your sales pipeline filters."
              colSpan={colCount}
            />
          ) : (
            filteredLeads.map((lead, index) => {
              const href = `${pathname}/${lead.id}`;
              return (
                <tr
                  key={lead.id}
                  className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 px-4 text-center font-bold text-[var(--text-muted)] tabular-nums group-hover:text-[var(--brand-700)]">
                    <Link href={href} className="block text-inherit text-decoration-none">
                      {index + 1}
                    </Link>
                  </td>
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
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-secondary)] tabular-nums">
                    <Link href={href} className="block text-inherit text-decoration-none">
                      {lead.phone || "—"}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <Link href={href} className="block text-decoration-none">
                      <StatusPill status={lead.status} />
                    </Link>
                  </td>
                  {isManagerView && (
                    <td className="py-3.5 px-4 text-xs font-semibold text-[var(--text-secondary)]">
                      <Link href={href} className="block text-inherit text-decoration-none">
                        {lead.assignedUser ? (
                          lead.assignedUser.name || lead.assignedUser.username
                        ) : (
                          <span className="text-slate-400 font-normal italic">
                            Unassigned
                          </span>
                        )}
                      </Link>
                    </td>
                  )}
                  <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] tabular-nums">
                    <Link href={href} className="block text-inherit text-decoration-none">
                      {formatDate(lead.siteVisitScheduledDate)}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <Link href={href} className="block text-decoration-none">
                      {lead.siteVisitCompletedDate ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {formatDate(lead.siteVisitCompletedDate)}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium">—</span>
                      )}
                    </Link>
                  </td>
                  {!isManagerView && (
                    <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] tabular-nums">
                      <Link href={href} className="block text-inherit text-decoration-none">
                        {formatDate(lead.lastContactDate)}
                      </Link>
                    </td>
                  )}
                  <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] tabular-nums">
                    <Link href={href} className="block text-inherit text-decoration-none">
                      {formatDate(lead.nextFollowUpDate)}
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
