import React from 'react';
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { SiteVisit, INTEREST_LEVEL_COLORS, SiteVisitCompleteModalData } from '@/features/leads/types/site-visit-constants';
import { SiteVisitViewMode } from '@/features/leads/components/site-visits/SiteVisitViewMode';
import { SiteVisitEditMode } from '@/features/leads/components/site-visits/SiteVisitEditMode';

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
    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all mb-2">
      {/* Header row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
        onClick={() => toggleExpand(sv.id)}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
            <Building2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{sv.project?.name || 'Project'}</p>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Completed: {sv.completedAt ? new Date(sv.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sv.interestLevel && (
            <span className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${INTEREST_LEVEL_COLORS[sv.interestLevel] || 'bg-gray-100 text-gray-600'}`}>
              {sv.interestLevel.replace('_', ' ')}
            </span>
          )}
          <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4">
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
