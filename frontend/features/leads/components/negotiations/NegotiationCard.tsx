'use client';

import React from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { NegotiationNote } from '@/features/leads/types/negotiation-types';
import { useNegotiation } from '@/features/leads/hooks/useNegotiation';
import { NegotiationAddForm } from '@/features/leads/components/negotiations/NegotiationAddForm';
import { NegotiationTimeline } from '@/features/leads/components/negotiations/NegotiationTimeline';

interface NegotiationCardProps {
  notes: NegotiationNote[];
  leadId: string;
  userId: string;
  onRefresh: () => void;
}

export function NegotiationCard({ notes, leadId, userId, onRefresh }: NegotiationCardProps) {
  const negotiationNotes = notes.filter(n => n.noteType === 'NEGOTIATION');
  
  const {
    showForm,
    setShowForm,
    saving,
    form,
    setForm,
    handleAddRound,
  } = useNegotiation(leadId, userId, onRefresh);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50/80 flex items-center justify-center border border-violet-100/50">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Negotiation</h3>
            <p className="text-xs text-gray-500 font-medium">{negotiationNotes.length} round{negotiationNotes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded-lg font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Round
        </button>
      </div>

      <div className="p-6 space-y-5">
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

