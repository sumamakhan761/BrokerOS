import React from "react";
import { EmployeeDashboardData } from "./types";
import { ArchiveRestore, CheckCircle2 } from "lucide-react";

export function EmployeeBacklogs({ backlogs, hasBacklog }: { backlogs: EmployeeDashboardData["backlogs"], hasBacklog: boolean }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border ${hasBacklog ? 'border-red-200' : 'border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-6">
        <ArchiveRestore className={`w-5 h-5 ${hasBacklog ? 'text-red-500' : 'text-slate-400'}`} />
        <h2 className="text-lg font-bold text-slate-900 m-0">Backlogs</h2>
      </div>
      {!hasBacklog ? (
        <div className="text-center py-6 text-slate-500 flex flex-col items-center gap-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          <span className="text-sm font-medium">All caught up! No backlogs.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {backlogs.coldCallBacklogCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-red-800">Cold Call Backlog</span>
                <span className="bg-red-200 text-red-900 rounded-full px-2.5 py-0.5 text-[13px] font-black">{backlogs.coldCallBacklogCount}</span>
              </div>
            </div>
          )}

          {backlogs.missedFollowUps.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[13px] font-bold text-amber-800">Missed Follow-ups</span>
                <span className="bg-amber-200 text-amber-900 rounded-full px-2.5 py-0.5 text-[13px] font-black">{backlogs.missedFollowUps.length}</span>
              </div>
              <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                {backlogs.missedFollowUps.slice(0, 5).map((fu) => (
                  <div key={fu.id} className="flex justify-between items-center text-[12px] py-1.5 border-b border-amber-100/50 last:border-0">
                    <span className="text-amber-700 font-bold truncate max-w-[120px]">{fu.lead ? `${fu.lead.firstName} ${fu.lead.lastName || ""}`.trim() : "—"}</span>
                    <span className="text-amber-600/80 font-medium whitespace-nowrap">{new Date(fu.scheduledDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
