// ============================================================================
// BrokerOS — SMS Start New Conversation Modal
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Phone, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { SmsConversation } from '../../types/inbox';

interface StartNewSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationStarted: (conv: SmsConversation) => void;
}

export const StartNewSmsModal: React.FC<StartNewSmsModalProps> = ({
  isOpen,
  onClose,
  onConversationStarted,
}) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [search, setSearch] = useState('');

  // Manual SMS state
  const [manualPhone, setManualPhone] = useState('');
  const [manualName, setManualName] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!isOpen) return;

    async function loadLeads() {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/leads?limit=30`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setLeads(data.data || data.items || []);
        }
      } catch (err) {
        console.error('Error loading leads for new SMS:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, [isOpen, baseUrl]);

  if (!isOpen) return null;

  const handleStartWithLead = async (lead: any) => {
    const phone = lead.phone || lead.phoneNumber || '';
    if (!phone) {
      toast.error('This lead does not have a registered phone number');
      return;
    }

    const leadName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Prospect';

    try {
      setStarting(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadId: lead.id,
          contactPhone: phone,
          contactName: leadName,
          initialMessage: initialMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to start SMS conversation');
      }

      const conv = await res.json();
      toast.success(`SMS thread started with ${leadName}`);
      onConversationStarted(conv);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not start SMS thread');
    } finally {
      setStarting(false);
    }
  };

  const handleStartWithManualPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = manualPhone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 8) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }

    try {
      setStarting(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contactPhone: cleanPhone,
          contactName: manualName.trim() || cleanPhone,
          initialMessage: initialMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to start SMS conversation');
      }

      const conv = await res.json();
      toast.success(`SMS conversation created for ${cleanPhone}`);
      onConversationStarted(conv);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not start SMS conversation');
    } finally {
      setStarting(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const name = `${l.firstName || ''} ${l.lastName || ''}`.toLowerCase();
    const phone = (l.phone || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Start New SMS Conversation</h3>
              <p className="text-xs text-text-tertiary">Select a CRM lead or text any prospect mobile number</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Option A: Direct Mobile Input */}
          <form onSubmit={handleStartWithManualPhone} className="p-4 rounded-xl bg-bg-base border border-border-default space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Direct Mobile Contact</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                required
                placeholder="Mobile number (e.g. +1... or +91...)"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs font-mono text-text-primary focus:outline-hidden focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Prospect name (optional)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Initial SMS text (optional — will dispatch immediately)..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-amber-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={starting || !manualPhone.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {starting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Open SMS Thread</span>
              </button>
            </div>
          </form>

          {/* Option B: Choose from CRM Leads */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Or Select CRM Lead</h4>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="divide-y divide-border-subtle max-h-56 overflow-y-auto border border-border-default rounded-xl bg-bg-surface">
              {loading ? (
                <div className="p-6 text-center text-xs text-text-tertiary">Loading CRM leads...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-tertiary">No matching leads found</div>
              ) : (
                filteredLeads.map((lead) => {
                  const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Prospect';
                  return (
                    <div
                      key={lead.id}
                      onClick={() => handleStartWithLead(lead)}
                      className="p-3 flex items-center justify-between hover:bg-bg-subtle cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{name}</p>
                          <p className="text-[11px] font-mono text-text-secondary truncate">{lead.phone || 'No phone'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-subtle border border-border-default text-text-tertiary font-medium">
                        {lead.status || 'NEW'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
