import React from "react";
import Link from "next/link";
import { Phone, MapPin, UserCheck, ExternalLink, MoreVertical } from "lucide-react";
import {
  SkeletonRows,
  EmptyState,
} from "@/features/leads/components/tables/TablePrimitives";

const BROKER_STATUS_CLASSES: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700 border-sky-200",
  CONTACTED: "bg-purple-50 text-purple-700 border-purple-200",
  VISIT: "bg-amber-50 text-amber-800 border-amber-200",
  DEAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-rose-50 text-rose-700 border-rose-200",
  BLACKLISTED: "bg-rose-100 text-rose-800 border-rose-300",
};

interface BrokerTableProps {
  loading: boolean;
  filteredBrokers: any[];
  isCP: boolean;
  setAssignModalBroker: (broker: any) => void;
}

export function BrokerTable({
  loading,
  filteredBrokers,
  isCP,
  setAssignModalBroker,
}: BrokerTableProps) {
  const colCount = isCP ? 7 : 6;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse min-w-[840px]">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/80 text-left">
            <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] w-12 text-center">
              #
            </th>
            <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Broker / Agency
            </th>
            <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Contact
            </th>
            <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Location
            </th>
            <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Status
            </th>
            {isCP && (
              <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Sourcing Manager
              </th>
            )}
            <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-xs">
          {loading ? (
            <SkeletonRows cols={colCount} />
          ) : filteredBrokers.length === 0 ? (
            <EmptyState
              message="No brokers found matching the search criteria."
              colSpan={colCount}
            />
          ) : (
            filteredBrokers.map((broker, index) => {
              const brokerLink = isCP
                ? `/dashboard/channel-partner/broker-management/${broker.id}`
                : `/dashboard/sourcing-manager/broker-management/${broker.id}`;
              const statusKey = broker.status as string;
              const statusClass =
                BROKER_STATUS_CLASSES[statusKey] ||
                "bg-slate-50 text-slate-700 border-slate-200";

              return (
                <tr
                  key={broker.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-4 text-center font-bold text-[var(--text-muted)] tabular-nums">
                    <Link
                      href={brokerLink}
                      className="block no-underline text-inherit"
                    >
                      {index + 1}
                    </Link>
                  </td>

                  <td className="py-3 px-4">
                    <Link
                      href={brokerLink}
                      className="block no-underline text-inherit"
                    >
                      <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--brand-700)] transition-colors">
                        {broker.companyName || "Independent Broker"}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                        {broker.name}
                      </div>
                    </Link>
                  </td>

                  <td className="py-3 px-4">
                    <Link
                      href={brokerLink}
                      className="flex items-center gap-1.5 no-underline text-[var(--text-secondary)] font-semibold tabular-nums"
                    >
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span>{broker.phone}</span>
                    </Link>
                  </td>

                  <td className="py-3 px-4">
                    <Link
                      href={brokerLink}
                      className="flex items-center gap-1.5 no-underline text-[var(--text-secondary)] font-medium"
                    >
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span>{broker.city || "—"}</span>
                    </Link>
                  </td>

                  <td className="py-3 px-4">
                    <Link
                      href={brokerLink}
                      className="block no-underline text-inherit"
                    >
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusClass}`}
                      >
                        <span>{broker.status}</span>
                        {broker.subStatus && (
                          <span className="opacity-70 font-semibold">
                            · {broker.subStatus}
                          </span>
                        )}
                      </span>
                    </Link>
                  </td>

                  {isCP && (
                    <td className="py-3 px-4">
                      <Link
                        href={brokerLink}
                        className="flex items-center gap-1.5 no-underline text-[var(--text-secondary)] font-semibold"
                      >
                        {broker.sourcingManager ? (
                          <>
                            <UserCheck
                              size={13}
                              className="text-emerald-600 shrink-0"
                            />
                            <span>{broker.sourcingManager.name}</span>
                          </>
                        ) : (
                          <span className="text-[var(--text-muted)] italic font-normal">
                            Unassigned
                          </span>
                        )}
                      </Link>
                    </td>
                  )}

                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={brokerLink}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-700)] bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-all active:scale-[0.96] press-effect shadow-2xs"
                      >
                        <ExternalLink size={11} />
                        <span>View</span>
                      </Link>

                      {isCP && (
                        <button
                          onClick={() => setAssignModalBroker(broker)}
                          className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-all active:scale-[0.96] press-effect cursor-pointer"
                          title="Assign Sourcing Manager"
                        >
                          <MoreVertical size={13} />
                        </button>
                      )}
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
