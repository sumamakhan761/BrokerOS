'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { SiteVisit } from '@/features/leads/types/site-visit-constants';
import { useSiteVisitCompleted } from '@/features/leads/hooks/useSiteVisitCompleted';
import { SiteVisitRow } from '@/features/leads/components/site-visits/SiteVisitRow';

interface SiteVisitCompletedCardProps {
  siteVisits: SiteVisit[];
  leadId: string;
  onRefresh: () => void;
}

export function SiteVisitCompletedCard({ siteVisits, leadId, onRefresh }: SiteVisitCompletedCardProps) {
  const completedVisits = siteVisits.filter(sv => sv.status === 'COMPLETED' || sv.completedAt);

  const {
    expandedId,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    saving,
    startEdit,
    saveEdit,
    toggleExpand,
  } = useSiteVisitCompleted(onRefresh);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50/80 flex items-center justify-center border border-emerald-100/50">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Site Visits Completed</h3>
          <p className="text-xs text-gray-500 font-medium">{completedVisits.length} completed visit{completedVisits.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {completedVisits.length === 0 ? (
          <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No completed site visits yet</p>
          </div>
        ) : (
          completedVisits.map(sv => (
            <SiteVisitRow
              key={sv.id}
              sv={sv}
              expandedId={expandedId}
              toggleExpand={toggleExpand}
              editingId={editingId}
              setEditingId={setEditingId}
              editForm={editForm}
              setEditForm={setEditForm}
              saving={saving}
              startEdit={startEdit}
              saveEdit={saveEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

