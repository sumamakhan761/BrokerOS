// ============================================================================
// BrokerOS — SMS Start New Conversation Modal
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Phone, Loader2, User, Building, Send } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-enter">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold">Start New SMS Conversation</h3>
              <p className="text-[11px] text-amber-200/80">
                Direct mobile outreach to CRM leads or any mobile number.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Option A: Search Existing CRM Lead */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Option A: Select from CRM Leads
            </span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search CRM leads by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
              />
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/50">
              {loading ? (
                <div className="p-4 text-center text-slate-400">Loading leads...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No leads matching search.</div>
              ) : (
                filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => handleStartWithLead(lead)}
                    disabled={starting}
                    className="w-full p-2 text-left hover:bg-amber-50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900">
                        {lead.firstName} {lead.lastName || ''}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{lead.phone || 'No phone'}</div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Start Thread &rarr;
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative z-10">
              Or Manual Input
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
          </div>

          {/* Option B: Enter Manual Phone */}
          <form onSubmit={handleStartWithManualPhone} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone *:</label>
                <input
                  type="tel"
                  required
                  placeholder="+14155550199 or +91..."
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Name:</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Initial SMS Message (Optional):</label>
              <textarea
                rows={2}
                placeholder="Type first outbound SMS..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={starting || !manualPhone}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              {starting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{starting ? 'Initiating Thread...' : 'Start SMS Conversation'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
