import React from "react";
import { UserCheck, X } from "lucide-react";

interface AssignBrokerModalProps {
  assignModalBroker: any;
  sourcingManagers: any[];
  handleAssign: (brokerId: string, smId: string) => void;
  setAssignModalBroker: (broker: any) => void;
}

export function AssignBrokerModal({
  assignModalBroker,
  sourcingManagers,
  handleAssign,
  setAssignModalBroker,
}: AssignBrokerModalProps) {
  if (!assignModalBroker) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-enter">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-slate-200/80">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[var(--brand-700)]">
              <UserCheck size={16} />
            </div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight m-0">
              Assign Sourcing Manager
            </h2>
          </div>
          <button
            onClick={() => setAssignModalBroker(null)}
            className="w-7 h-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)] m-0 leading-relaxed">
          Select the designated sourcing manager for{" "}
          <strong className="text-[var(--text-primary)]">
            {assignModalBroker.name} ({assignModalBroker.companyName || "Agency"})
          </strong>
          :
        </p>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {sourcingManagers.map((sm) => {
            const isAssigned =
              assignModalBroker.sourcingManagerId === sm.id;

            return (
              <button
                key={sm.id}
                onClick={() => handleAssign(assignModalBroker.id, sm.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-[0.96] press-effect cursor-pointer flex items-center justify-between ${
                  isAssigned
                    ? "border-[var(--brand-600)] bg-purple-50 text-[var(--brand-700)] shadow-2xs"
                    : "border-slate-200 hover:bg-slate-50 text-[var(--text-primary)]"
                }`}
              >
                <span>{sm.name}</span>
                {isAssigned && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--brand-700)] bg-white px-2 py-0.5 rounded-full border border-purple-200">
                    Current
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setAssignModalBroker(null)}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.96] press-effect cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
