// ============================================================================
// BrokerOS — WhatsApp Start New Chat / Select Contact Modal
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  MessageSquare,
  Phone,
  Loader2,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import type { WhatsAppConversation, WhatsAppContact } from '../../types';

interface StartNewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationStarted: (conv: WhatsAppConversation) => void;
  accountId?: string;
}

export const StartNewChatModal: React.FC<StartNewChatModalProps> = ({
  isOpen,
  onClose,
  onConversationStarted,
  accountId,
}) => {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [search, setSearch] = useState('');
  const [manualPhone, setManualPhone] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!isOpen) return;

    async function loadContacts() {
      try {
        setLoading(true);
        const q = new URLSearchParams();
        if (accountId) q.set('accountId', accountId);
        q.set('limit', '100');

        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/contacts?${q.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setContacts(data.items || []);
        }
      } catch (err) {
        console.error('Error loading contacts for new chat:', err);
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, [isOpen, accountId, baseUrl]);

  if (!isOpen) return null;

  const handleStartWithContact = async (contact: WhatsAppContact) => {
    try {
      setStarting(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: contact.id,
          phone: contact.phone,
          name: contact.name,
          leadId: contact.leadId,
          accountId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to start conversation');
      }

      const conv = await res.json();
      toast.success(`Chat opened with ${contact.name || contact.phone}`);
      onConversationStarted(conv);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not start chat');
    } finally {
      setStarting(false);
    }
  };

  const handleStartWithManualPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone.trim()) return;

    try {
      setStarting(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: manualPhone.trim(),
          accountId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to start conversation with phone');
      }

      const conv = await res.json();
      toast.success(`Chat opened with ${manualPhone.trim()}`);
      onConversationStarted(conv);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Could not start chat');
    } finally {
      setStarting(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term) ||
      (c.email || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Start New WhatsApp Chat</h3>
              <p className="text-[11px] text-text-secondary">
                Select an existing CRM lead/contact or enter a new number.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Manual Direct Phone Form */}
          <form onSubmit={handleStartWithManualPhone} className="space-y-2">
            <label className="text-xs font-semibold text-text-primary block">
              Direct Phone Number (with Country Code)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-text-tertiary absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="e.g. 144444444"
                  className="w-full pl-9 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={starting || !manualPhone.trim()}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
              >
                Chat
              </button>
            </div>
          </form>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-border-default w-full" />
            <span className="bg-bg-surface px-2 text-[10px] uppercase font-bold text-text-tertiary absolute">
              or select CRM contact
            </span>
          </div>

          {/* Contact Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads by name, phone or email..."
              className="w-full pl-9 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500"
            />
          </div>

          {/* Contacts List */}
          <div className="divide-y divide-border-subtle border border-border-default rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-xs text-text-tertiary">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-tertiary">
                No contacts found matching search.
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleStartWithContact(contact)}
                  className="flex items-center justify-between p-3 hover:bg-bg-subtle cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {(contact.name || contact.phone).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {contact.name || 'Unnamed Contact'}
                      </p>
                      <p className="text-[11px] font-mono text-text-tertiary truncate">
                        {contact.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {contact.lead && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-medium">
                        <Flame className="w-2.5 h-2.5" />
                        <span>{contact.lead.status}</span>
                      </span>
                    )}
                    <span className="text-xs font-semibold text-brand-600 group-hover:underline">
                      Start
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-default bg-bg-subtle/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-text-secondary hover:bg-bg-subtle border border-border-default transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
