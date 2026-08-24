"use client";

import React from "react";
import { TrendingUp, Plus } from "lucide-react";
import { useNegotiation } from "@/features/leads/hooks/useNegotiation";
import { NegotiationAddForm } from "@/features/leads/components/negotiations/NegotiationAddForm";
import { NegotiationTimeline } from "@/features/leads/components/negotiations/NegotiationTimeline";

interface NegotiationCardProps {
  negotiations: any[];
  leadId: string;
  userId: string;
  onRefresh: () => void;
}

export function NegotiationCard({
  negotiations,
  leadId,
  userId,
  onRefresh,
}: NegotiationCardProps) {
  const negotiationNotes = negotiations;

  const {
    showForm,
    setShowForm,
    saving,
    form,
    setForm,
    handleAddRound,
  } = useNegotiation(leadId, userId, onRefresh);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-200 text-[var(--brand-700)]">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] m-0">
              Pricing Negotiations
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5 tabular-nums m-0">
              {negotiationNotes.length} round
              {negotiationNotes.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-[var(--brand-700)] hover:bg-purple-100 border border-purple-200 px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-[0.96] press-effect shadow-2xs cursor-pointer"
        >
          <Plus size={13} />
          <span>{showForm ? "Cancel" : "Add Round"}</span>
        </button>
      </div>

      <div className="p-5 space-y-4">
        {showForm && (
          <NegotiationAddForm
            form={form}
            setForm={setForm}
            saving={saving}
            handleAddRound={handleAddRound}
            onCancel={() => setShowForm(false)}
          />
        )}
        <NegotiationTimeline negotiationNotes={negotiationNotes} />
      </div>
    </div>
  );
}
