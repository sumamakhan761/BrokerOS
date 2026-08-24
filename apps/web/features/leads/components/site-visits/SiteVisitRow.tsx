import React from "react";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";
import {
  SiteVisit,
  INTEREST_LEVEL_COLORS,
  SiteVisitCompleteModalData,
} from "@/features/leads/types/site-visit-constants";
import { SiteVisitViewMode } from "@/features/leads/components/site-visits/SiteVisitViewMode";
import { SiteVisitEditMode } from "@/features/leads/components/site-visits/SiteVisitEditMode";

interface SiteVisitRowProps {
  sv: SiteVisit;
  expandedId: string | null;
  toggleExpand: (id: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editForm: SiteVisitCompleteModalData | null;
  setEditForm: (form: SiteVisitCompleteModalData | null) => void;
  saving: boolean;
  startEdit: (sv: SiteVisit) => void;
  saveEdit: (svId: string) => void;
}

export function SiteVisitRow({
  sv,
  expandedId,
  toggleExpand,
  editingId,
  setEditingId,
  editForm,
  setEditForm,
  saving,
  startEdit,
  saveEdit,
}: SiteVisitRowProps) {
  const isExpanded = expandedId === sv.id;
  const isEditing = editingId === sv.id;

  return (
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs transition-all bg-white mb-2.5">
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
        onClick={() => toggleExpand(sv.id)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-700">
            <Building2 size={18} />
          </div>
          <div>
            <p className="font-bold text-xs text-[var(--text-primary)] m-0">
              {sv.project?.name || "Project Site"}
            </p>
            <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5 tabular-nums m-0">
              Completed:{" "}
              {sv.completedAt
                ? new Date(sv.completedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sv.interestLevel && (
            <span
              className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold border ${
                INTEREST_LEVEL_COLORS[sv.interestLevel] ||
                "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {sv.interestLevel.replace("_", " ")}
            </span>
          )}
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 text-slate-500">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-5 bg-slate-50/40 space-y-4 animate-enter">
          {isEditing && editForm ? (
            <SiteVisitEditMode
              svId={sv.id}
              editForm={editForm}
              setEditForm={setEditForm}
              saving={saving}
              saveEdit={saveEdit}
              onCancel={() => {
                setEditingId(null);
                setEditForm(null);
              }}
            />
          ) : (
            <SiteVisitViewMode sv={sv} startEdit={startEdit} />
          )}
        </div>
      )}
    </div>
  );
}
