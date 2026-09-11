// ============================================================================
// BrokerOS — Email Start New Conversation Modal
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Mail, Loader2, User, Building, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { EmailConversation } from '../../types/inbox';

interface StartNewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationStarted: (conv: EmailConversation) => void;
}

export const StartNewEmailModal: React.FC<StartNewEmailModalProps> = ({
  isOpen,
  onClose,
  onConversationStarted,
}) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [search, setSearch] = useState('');

  // Manual email state
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualSubject, setManualSubject] = useState('');
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
        console.error('Error loading leads for new email:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLeads();
  }, [isOpen, baseUrl]);

  if (!isOpen) return null;

  const handleStartWithLead = async (lead: any) => {
    const email = lead.email || '';
    if (!email) {
      toast.error('This lead does not have an email address');
      return;
    }

    const leadName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Prospect';

    try {
      setStarting(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadId: lead.id,
          contactEmail: email,
          contactName: leadName,
          subject: `Exclusive Property Inquiry · ${leadName}`,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to start conversation');
      }

      const conv = await res.json();
      toast.success(`Email thread started with ${leadName}`);
      onConversationStarted(conv);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not start email thread');
    } finally {
      setStarting(false);
    }
  };

  const handleStartWithManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim() || !manualSubject.trim()) {
      toast.error('Email and Subject are required');
      return;
    }

    try {
      setStarting(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contactEmail: manualEmail.trim(),
          contactName: manualName.trim() || undefined,
          subject: manualSubject.trim(),
          initialMessage: initialMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to start email thread');
      }

      const conv = await res.json();
      toast.success(`Email thread started with ${manualEmail}`);
      onConversationStarted(conv);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not start conversation');
    } finally {
      setStarting(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const fullName = `${l.firstName || ''} ${l.lastName || ''}`.toLowerCase();
    const email = (l.email || '').toLowerCase();
    const phone = (l.phone || '').toLowerCase();
    const q = search.toLowerCase();
    return fullName.includes(q) || email.includes(q) || phone.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Start New Email Conversation</h3>
              <p className="text-xs text-text-tertiary">Select a CRM lead or send to any prospect email</p>
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
          {/* Option A: Quick Manual Send */}
          <form onSubmit={handleStartWithManualEmail} className="p-4 rounded-xl bg-bg-base border border-border-default space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Direct Prospect Email</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="email"
                required
                placeholder="Prospect email (e.g. client@gmail.com)"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
              />
              <input
                type="text"
                placeholder="Prospect name (optional)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Subject (e.g. Skyline Residences Brochure & Pricing)"
              value={manualSubject}
              onChange={(e) => setManualSubject(e.target.value)}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
            />
            <textarea
              rows={2}
              placeholder="Initial message (optional — will send immediately)..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={starting || !manualEmail.trim() || !manualSubject.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {starting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Open Email Thread</span>
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
                placeholder="Search leads by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="divide-y divide-border-subtle max-h-56 overflow-y-auto border border-border-default rounded-xl bg-bg-surface">
              {loading ? (
                <div className="p-6 text-center text-xs text-text-tertiary">Loading CRM leads...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-tertiary">No matching leads found</div>
              ) : (
                filteredLeads.map((lead) => {
                  const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Lead';
                  return (
                    <div
                      key={lead.id}
                      onClick={() => handleStartWithLead(lead)}
                      className="p-3 flex items-center justify-between hover:bg-bg-subtle cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-text-primary truncate">{name}</p>
                          <p className="text-[11px] text-text-secondary truncate">{lead.email || 'No email'}</p>
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
