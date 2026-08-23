import { useState } from 'react';
import { NegotiationFormData } from '@/features/leads/types/negotiation-types';

export function useNegotiation(leadId: string, userId: string, onRefresh: () => void) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NegotiationFormData>({
    title: '',
    askingPrice: '',
    offeredPrice: '',
    objections: '',
    strategy: '',
    nextStep: '',
  });

  const handleAddRound = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      const res = await fetch(`${apiUrl}/api/leads/${leadId}/negotiations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          askingPrice: form.askingPrice,
          offeredPrice: form.offeredPrice,
          objections: form.objections,
          strategy: form.strategy,
          title: form.title,
          nextStep: form.nextStep,
        }),
      });
      if (res.ok) {
        setForm({ title: '', askingPrice: '', offeredPrice: '', objections: '', strategy: '', nextStep: '' });
        setShowForm(false);
        onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    showForm,
    setShowForm,
    saving,
    form,
    setForm,
    handleAddRound,
  };
}
