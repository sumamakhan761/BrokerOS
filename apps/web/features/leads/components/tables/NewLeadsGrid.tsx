import React from "react";
import { UserPlus } from "lucide-react";
import {
  SkeletonRows,
  EmptyState,
  formatDate,
} from "./TablePrimitives";

interface NewLeadsGridProps {
  leads: any[];
  loading: boolean;
  selectedLeadIds: Set<string>;
  subordinates: any[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onAssign: (leadIds: string[], targetUserId?: string, roundRobin?: boolean) => void;
}

export function NewLeadsGrid({
  leads,
  loading,
  selectedLeadIds,
  subordinates,
  onSelectAll,
  onSelectOne,
  onAssign,
}: NewLeadsGridProps) {
  const colCount = 5;
  const allSelected = leads.length > 0 && selectedLeadIds.size === leads.length;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <table className="w-full border-collapse min-w-[720px] text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200/80">
          <tr>
            <th className="py-3 px-4 w-12 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded text-[var(--brand-600)] focus:ring-[var(--brand-500)] cursor-pointer accent-[var(--brand-600)]"
              />
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Lead Name
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Phone Number
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
              Date Ingested
            </th>
            <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[10px] text-[var(--text-muted)] text-right">
              Direct Assignment
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : leads.length === 0 ? (
            <EmptyState
              message="No new unassigned leads waiting in the queue."
              colSpan={colCount}
            />
          ) : (
            leads.map((lead) => {
              const isSelected = selectedLeadIds.has(lead.id);
              return (
                <tr
                  key={lead.id}
                  className={`transition-colors ${
                    isSelected ? "bg-purple-50/60" : "hover:bg-slate-50/60"
                  }`}
                >
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectOne(e, lead.id)}
                      className="w-4 h-4 rounded text-[var(--brand-600)] focus:ring-[var(--brand-500)] cursor-pointer accent-[var(--brand-600)]"
                    />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      {lead.firstName} {lead.lastName || ""}
                    </div>
                    {lead.project && (
                      <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
                        {lead.project}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-secondary)] tabular-nums">
                    {lead.phone || "—"}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[var(--text-secondary)] tabular-nums">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <div className="relative min-w-[140px]">
                        <UserPlus
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              onAssign([lead.id], e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="w-full h-8 ps-7 pe-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-purple-500/15 cursor-pointer appearance-none transition-all"
                        >
                          <option value="">Assign to…</option>
                          {subordinates.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name || sub.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
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
