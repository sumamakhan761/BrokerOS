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
  
  const colors = {
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      borderSelected: "border-indigo-600",
      bgSelected: "bg-indigo-600",
      textTitle: "text-indigo-900",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      borderSelected: "border-emerald-600",
      bgSelected: "bg-emerald-600",
      textTitle: "text-emerald-900",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      borderSelected: "border-blue-600",
      bgSelected: "bg-blue-600",
      textTitle: "text-blue-900",
    }
  };

  const scheme = colors[colorScheme];

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col h-72">
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-3">
        <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
      </div>
      <div className="p-2 overflow-y-auto flex-1">
        {subordinates.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No {title} found.</p>
        ) : (
          subordinates.map(sub => {
            const isSelected = selectedIds.includes(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => onToggle(sub.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors mb-1 ${
                  isSelected ? `${scheme.bg} border ${scheme.border}` : "hover:bg-slate-200 border border-transparent"
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? `${scheme.bgSelected} ${scheme.borderSelected}` : "bg-white border-slate-300"
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="truncate">
                  <p className={`text-sm font-medium ${isSelected ? scheme.textTitle : "text-slate-700"}`}>{sub.name}</p>
                  <p className="text-xs text-slate-500 truncate">{sub.email}</p>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  );
}
