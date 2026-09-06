// ============================================================================
// BrokerOS — WhatsApp Deal Form Modal (Create & Edit)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Check,
  Calendar,
  IndianRupee,
  User,
  Layers,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WhatsAppDealItem } from './DealCard';
import type { PipelineStageItem } from './PipelineBoard';

interface DealFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: WhatsAppDealItem | null;
  pipelineId: string;
  stages: PipelineStageItem[];
  defaultStageId?: string;
  onSaved: () => void;
}

export function DealFormModal({
  open,
  onOpenChange,
  deal,
  pipelineId,
  stages,
  defaultStageId,
  onSaved,
}: DealFormModalProps) {
  const isEditing = !!deal;

  const [title, setTitle] = useState('');
  const [value, setValue] = useState<number | string>('');
  const [stageId, setStageId] = useState('');
  const [contactId, setContactId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'won' | 'lost'>('active');

  const [contacts, setContacts] = useState<Array<{ id: string; name?: string | null; phone: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; name?: string | null; email: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (deal) {
      setTitle(deal.title || '');
      setValue(deal.value || '');
      setStageId(deal.stageId || stages[0]?.id || '');
      setContactId(deal.contactId || '');
      setAssignedUserId(deal.assignedUserId || '');
      setExpectedCloseDate(
        deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
      );
      setNotes(deal.notes || '');
      setStatus(deal.status || 'active');
    } else {
      setTitle('');
      setValue('');
      setStageId(defaultStageId || stages[0]?.id || '');
      setContactId('');
      setAssignedUserId('');
      setExpectedCloseDate('');
      setNotes('');
      setStatus('active');
    }
  }, [open, deal, defaultStageId, stages]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!open) return;
    async function loadOptions() {
      try {
        const [cRes, uRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/contacts?limit=200`),
          fetch(`${baseUrl}/api/leads/assignees`).catch(() => null),
        ]);
        if (cRes.ok) {
          const cData = await cRes.json();
          setContacts(Array.isArray(cData) ? cData : cData.items || []);
        }
        if (uRes?.ok) {
          const uData = await uRes.json();
          setUsers(Array.isArray(uData) ? uData : uData.users || []);
        }
      } catch (err) {
        console.error('Error loading options:', err);
      }
    }
    loadOptions();
  }, [open, baseUrl]);

  if (!open) return null;

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Please enter a deal title');
      return;
    }
    if (!contactId) {
      toast.error('Please select an associated contact');
      return;
    }
    if (!stageId) {
      toast.error('Please select a pipeline stage');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        pipelineId,
        stageId,
        contactId,
        title: title.trim(),
        value: Number(value) || 0,
        notes: notes.trim() || undefined,
        status,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate).toISOString() : undefined,
        assignedUserId: assignedUserId || undefined,
      };

      const url = isEditing
        ? `${baseUrl}/api/marketing/whatsapp/deals/${deal.id}`
        : `${baseUrl}/api/marketing/whatsapp/deals`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save deal');

      toast.success(isEditing ? 'Deal updated' : 'Deal created');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Error saving deal');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deal) return;
    if (!confirm('Are you sure you want to delete this deal?')) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/deals/${deal.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete deal');
      toast.success('Deal deleted');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting deal');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-default pb-3">
          <h3 className="text-base font-bold text-text-primary">
            {isEditing ? 'Edit Deal' : 'Create New Deal'}
          </h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Deal Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3BHK Corner Unit Booking - Mr. Sharma"
              className="text-xs bg-bg-subtle"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Deal Value (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="h-3.5 w-3.5 text-text-muted absolute left-3 top-2.5" />
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="15000000"
                  className="pl-8 text-xs bg-bg-subtle"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Pipeline Stage *
              </label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-bg-subtle px-3 py-2 text-xs text-text-primary"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Associated Contact *
              </label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-bg-subtle px-3 py-2 text-xs text-text-primary"
              >
                <option value="">-- Choose Contact --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ? `${c.name} (${c.phone})` : c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Assigned Sales Rep
              </label>
              <select
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
                className="w-full rounded-xl border border-border-default bg-bg-subtle px-3 py-2 text-xs text-text-primary"
              >
                <option value="">-- Unassigned --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Expected Close Date
              </label>
              <Input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="text-xs bg-bg-subtle"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Deal Status
              </label>
              <div className="flex gap-1.5 pt-0.5">
                {(['active', 'won', 'lost'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={cn(
                      'flex-1 rounded-lg py-1.5 text-xs font-bold capitalize transition-colors',
                      status === st
                        ? st === 'won'
                          ? 'bg-emerald-600 text-white'
                          : st === 'lost'
                          ? 'bg-red-600 text-white'
                          : 'bg-brand-600 text-white'
                        : 'border border-border-default bg-bg-subtle text-text-muted hover:text-text-primary',
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Deal Notes & Preferences
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Client interested in higher floor, 100% self-funded, looking for possession by Dec 2026."
              className="text-xs bg-bg-subtle min-h-20"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border-default pt-4">
          {isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={submitting}
              className="text-xs text-red-600 border-red-500/30 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Deal
            </Button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={submitting}
              className="bg-brand-600 text-white hover:bg-brand-700 text-xs font-semibold px-4"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Deal' : 'Create Deal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
