import { useState } from 'react';
import { SiteVisit, SiteVisitCompleteModalData } from '@/features/leads/types/site-visit-constants';

export function useSiteVisitCompleted(onRefresh: () => void) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SiteVisitCompleteModalData | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (sv: SiteVisit) => {
    setEditingId(sv.id);
    setEditForm({
      interestLevel: sv.interestLevel || '',
      budgetConfirmed: sv.budgetConfirmed?.toString() || '',
      configInterest: sv.configInterest || '',
      customerReaction: sv.customerReaction || '',
      customerObjections: sv.customerObjections || '',
      closingProbability: sv.closingProbability || '',
      meetingNotes: sv.meetingNotes || '',
      nextAction: sv.nextAction || '',
    });
  };

  const saveEdit = async (svId: string) => {
    if (!editForm) return;
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/site-visits/${svId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interestLevel: editForm.interestLevel || undefined,
          budgetConfirmed: editForm.budgetConfirmed ? Number(editForm.budgetConfirmed) : undefined,
          configInterest: editForm.configInterest,
          customerReaction: editForm.customerReaction,
          customerObjections: editForm.customerObjections,
          closingProbability: editForm.closingProbability,
          meetingNotes: editForm.meetingNotes,
          nextAction: editForm.nextAction,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditForm(null);
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return {
    expandedId,
    editingId,
    setEditingId,
    editForm,
    setEditForm,
    saving,
    startEdit,
    saveEdit,
    toggleExpand,
  };
}
