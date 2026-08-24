import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import {
  StatusPill,
  SkeletonRows,
  EmptyState,
  formatDate,
} from "./TablePrimitives";

interface PostSalesTableProps {
  filteredLeads: any[];
  loading: boolean;
}

export function PostSalesTable({
  filteredLeads,
  loading,
}: PostSalesTableProps) {
  const pathname = usePathname();
  const colCount = 7;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full border-collapse min-w-[900px] text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200/80">
          <tr>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)] w-12 text-center">
              #
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Customer Name
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Phone Number
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Lifecycle Stage
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Milestone Status
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Possession Schedule
            </th>
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
              message="No customers found in the post-sales pipeline."
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
                  {/* Index */}
                  <td className="py-3.5 px-4 text-center font-bold text-[var(--text-muted)] tabular-nums group-hover:text-[var(--brand-700)]">
                    <Link href={href} className="block text-inherit text-decoration-none">
                      {index + 1}
                    </Link>
                  </td>

                  {/* Customer Name */}
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

                  {/* Stage */}
                  <td className="py-3.5 px-4">
                    <Link href={href} className="block text-decoration-none">
                      <StatusPill status={lead.status} />
                    </Link>
                  </td>

                  {/* Milestone */}
                  <td className="py-3.5 px-4">
                    <Link href={href} className="block text-decoration-none">
                      {lead.subStatus === "DONE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Done</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock size={12} />
                          <span>Pending</span>
                        </span>
                      )}
                    </Link>
                  </td>

                  {/* Possession */}
                  <td className="py-3.5 px-4">
                    <Link href={href} className="block text-decoration-none">
                      {lead.processionStatus ? (
                        <div>
                          <div className="text-xs font-bold text-[var(--text-secondary)]">
                            {lead.processionStatus.replace(/_/g, " ")}
                          </div>
                          {lead.processionTimeline && (
                            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 tabular-nums">
                              {lead.processionTimeline.value}{" "}
                              {lead.processionTimeline.unit} remaining
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 font-normal italic">
                          Not scheduled
                        </span>
                      )}
                    </Link>
                  </td>

                  {/* Next Follow-Up */}
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
