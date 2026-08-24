"use client";

import { Award, Building2, Users } from "lucide-react";

export function CPLeaderboards({ leaderboards }: { leaderboards: any }) {
  if (!leaderboards) return null;

  const {
    topProjects = [],
    topClosingManagers = [],
    topSourcingManagers = [],
    topBrokers = [],
  } = leaderboards;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {/* Column 1: Top Projects & Top Brokers */}
      <div className="space-y-4">
        {/* Top Projects */}
        <div className="bg-white border border-slate-200/80 shadow-2xs rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                <Building2 size={16} />
              </div>
              <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
                Top CP Developments
              </h2>
            </div>
          </div>

          {topProjects.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] font-semibold m-0 py-6 text-center">
              No project data available.
            </p>
          ) : (
            <div className="space-y-2">
              {topProjects.map((proj: any, idx: number) => {
                const colors = [
                  { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
                  { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
                  { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
                  { bg: "bg-purple-50", text: "text-[var(--brand-700)]", border: "border-purple-200" },
                ];
                const color = colors[Math.min(idx, 3)];
                return (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${color.bg} ${color.text} ${color.border} tabular-nums`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[var(--text-primary)] truncate m-0">
                          {proj.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-[var(--text-primary)] tabular-nums m-0">
                        {proj.bookings}
                      </p>
                      <p className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider m-0">
                        Bookings
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Brokers */}
        <div className="bg-white border border-slate-200/80 shadow-2xs rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
                <Users size={16} />
              </div>
              <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
                Top External Brokers
              </h2>
            </div>
          </div>

          {topBrokers.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] font-semibold m-0 py-6 text-center">
              No broker data available.
            </p>
          ) : (
            <div className="space-y-2">
              {topBrokers.map((broker: any) => (
                <div
                  key={broker.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-purple-50 text-[var(--brand-700)] rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border border-purple-200/60">
                      {broker.name?.[0] || "B"}
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 truncate m-0">
                      {broker.name}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-[var(--text-primary)] tabular-nums m-0">
                      {broker.bookings}{" "}
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        deals
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Column 2: Internal Teams */}
      <div className="bg-white border border-slate-200/80 shadow-2xs rounded-3xl p-5 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
            <Award size={16} />
          </div>
          <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider m-0">
            Top Internal CP Managers
          </h2>
        </div>

        {/* Top Sourcing Managers */}
        <div>
          <h3 className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-2 m-0">
            Top Sourcing Managers (SMs)
          </h3>
          {topSourcingManagers.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] font-semibold m-0 py-4 text-center">
              No sourcing manager data available.
            </p>
          ) : (
            <div className="space-y-2">
              {topSourcingManagers.map((sm: any) => (
                <div
                  key={sm.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border border-emerald-200/60">
                      {sm.name?.[0] || "S"}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate m-0">
                      {sm.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-emerald-700 tabular-nums m-0">
                      {sm.bookings}{" "}
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        broker deals
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Closing Managers */}
        <div>
          <h3 className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-2 m-0">
            Top Closing Managers (CMs)
          </h3>
          {topClosingManagers.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] font-semibold m-0 py-4 text-center">
              No closing manager data available.
            </p>
          ) : (
            <div className="space-y-2">
              {topClosingManagers.map((cm: any) => (
                <div
                  key={cm.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-100/60 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border border-blue-200/60">
                      {cm.name?.[0] || "C"}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate m-0">
                      {cm.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-blue-700 tabular-nums m-0">
                      {cm.bookings}{" "}
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        units closed
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
