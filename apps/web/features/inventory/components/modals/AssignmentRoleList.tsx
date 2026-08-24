import React from "react";
import { Check } from "lucide-react";
import { Subordinate } from "./useAssignmentModal";

interface AssignmentRoleListProps {
  title: string;
  subordinates: Subordinate[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  colorScheme: "indigo" | "emerald" | "blue";
}

export function AssignmentRoleList({
  title,
  subordinates,
  selectedIds,
  onToggle,
  colorScheme,
}: AssignmentRoleListProps) {
  const schemeClasses = {
    indigo: {
      bgSelected: "bg-purple-50 border-[var(--brand-600)] text-[var(--brand-700)] shadow-2xs",
      checkboxSelected: "bg-[var(--brand-600)] border-[var(--brand-600)]",
      titleColor: "text-[var(--brand-700)]",
    },
    emerald: {
      bgSelected: "bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs",
      checkboxSelected: "bg-emerald-600 border-emerald-600",
      titleColor: "text-emerald-800",
    },
    blue: {
      bgSelected: "bg-sky-50 border-sky-600 text-sky-800 shadow-2xs",
      checkboxSelected: "bg-sky-600 border-sky-600",
      titleColor: "text-sky-800",
    },
  }[colorScheme];

  return (
    <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col h-72">
      <div className="bg-slate-100/80 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
        <h4 className="font-extrabold text-[var(--text-primary)] text-xs m-0">
          {title}
        </h4>
        <span className="text-[10px] font-bold text-[var(--text-muted)] tabular-nums">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="p-2 overflow-y-auto flex-1 space-y-1">
        {subordinates.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] text-center py-8 italic m-0">
            No {title} available.
          </p>
        ) : (
          subordinates.map((sub) => {
            const isSelected = selectedIds.includes(sub.id);
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onToggle(sub.id)}
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all active:scale-[0.98] cursor-pointer border ${
                  isSelected
                    ? schemeClasses.bgSelected
                    : "hover:bg-white border-transparent text-[var(--text-primary)]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? schemeClasses.checkboxSelected
                      : "bg-white border-slate-300"
                  }`}
                >
                  {isSelected && <Check size={11} className="text-white stroke-[3]" />}
                </div>
                <div className="truncate flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold truncate m-0 ${
                      isSelected
                        ? schemeClasses.titleColor
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {sub.name}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5 m-0 font-medium">
                    {sub.email}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
