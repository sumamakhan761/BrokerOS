"use client";

import React from "react";
import { CheckCircle } from "lucide-react";
import { SiteVisit } from "@/features/leads/types/site-visit-constants";
import { useSiteVisitCompleted } from "@/features/leads/hooks/useSiteVisitCompleted";
import { SiteVisitRow } from "@/features/leads/components/site-visits/SiteVisitRow";

interface SiteVisitCompletedCardProps {
  siteVisits: SiteVisit[];
  leadId: string;
  onRefresh: () => void;
}

export function SiteVisitCompletedCard({
  siteVisits,
  leadId,
  onRefresh,
}: SiteVisitCompletedCardProps) {
  const completedVisits = siteVisits.filter(
    (sv) => sv.status === "COMPLETED" || sv.completedAt
  );

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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-700">
          <CheckCircle size={18} />
        </div>
        <div>
          <h3 className="text-xs font-bold text-[var(--text-primary)] m-0">
            Site Visits Completed
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 tabular-nums m-0">
            {completedVisits.length} completed visit
            {completedVisits.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {completedVisits.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-slate-100">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
              No completed site visits yet
            </p>
          </div>
        ) : (
          completedVisits.map((sv) => (
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
