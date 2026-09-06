'use client';

// ============================================================================
// BrokerOS — WhatsApp Contact Detail Drawer (Sheet / Slide-out)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import type { WhatsAppTemplate } from '../../types';
import { ContactOverviewTab } from './drawer/ContactOverviewTab';
import { ContactNotesTab } from './drawer/ContactNotesTab';
import { ContactFieldsTab } from './drawer/ContactFieldsTab';
import { ContactDealsTab } from './drawer/ContactDealsTab';
import { ContactSendTemplateTab } from './drawer/ContactSendTemplateTab';

interface ContactDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  contactId: string | null;
  accountId?: string;
  onUpdated?: () => void;
  onOpenChat?: (contactId: string) => void;
}

export const ContactDetailDrawer: React.FC<ContactDetailDrawerProps> = ({
  open,
  onClose,
  contactId,
  accountId,
  onUpdated,
  onOpenChat,
}) => {
  const [contact, setContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'fields' | 'deals' | 'template'>('overview');

  // Notes state
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Custom fields state
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [savingFields, setSavingFields] = useState(false);

  // Template send state
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Load contact details
  useEffect(() => {
    if (!open || !contactId) return;

    async function loadDetail() {
      try {
        setLoading(true);
        const [contactRes, fieldsRes, tplRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/contacts/${contactId}`),
          fetch(`${baseUrl}/api/marketing/whatsapp/custom-fields${accountId ? `?accountId=${accountId}` : ''}`),
          fetch(`${baseUrl}/api/marketing/whatsapp/templates?status=APPROVED${accountId ? `&accountId=${accountId}` : ''}`),
        ]);

        if (contactRes.ok) {
          const cData = await contactRes.json();
          setContact(cData);
          setNotes(cData.notes || []);

          // Populate custom values
          const valMap: Record<string, string> = {};
          (cData.customValues || []).forEach((cv: any) => {
            valMap[cv.fieldId] = cv.value;
          });
          setCustomValues(valMap);
        }

        if (fieldsRes.ok) {
          const fData = await fieldsRes.json();
          setCustomFields(Array.isArray(fData) ? fData : []);
        }

        if (tplRes.ok) {
          const tData = await tplRes.json();
          setTemplates(tData.items || []);
        }
      } catch (err) {
        console.error('Failed to load contact detail:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [open, contactId, baseUrl, accountId]);

  if (!open) return null;

  const handleCopyPhone = () => {
    if (!contact?.phone) return;
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !contactId) return;

    try {
      setSavingNote(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote.trim() }),
      });

      if (res.ok) {
        const created = await res.json();
        setNotes([created, ...notes]);
        setNewNote('');
        onUpdated?.();
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/contacts/${contactId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotes(notes.filter((n) => n.id !== noteId));
        onUpdated?.();
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleSaveFields = async () => {
    if (!contactId) return;
    try {
      setSavingFields(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/contacts/${contactId}/custom-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: customValues }),
      });
      if (res.ok) {
        onUpdated?.();
      }
    } catch (err) {
      console.error('Failed to save custom fields:', err);
    } finally {
      setSavingFields(false);
    }
  };

  const handleSendTemplate = async () => {
    if (!selectedTemplate || !contact?.phone) return;
    try {
      setSendingTemplate(true);
      setTemplateSuccess(null);
      setTemplateError(null);

      // Find or create conversation and send template
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/messages/send-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.phone,
          contactId: contact.id,
          accountId,
          templateName: selectedTemplate.name,
          templateLanguage: selectedTemplate.language || 'en_US',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to dispatch template (${res.status})`);
      }

      setTemplateSuccess(`Template "${selectedTemplate.name}" dispatched successfully to ${contact.phone}!`);
      onUpdated?.();
    } catch (err: any) {
      console.error('Failed to send template:', err);
      setTemplateError(err.message || 'Error dispatching template');
    } finally {
      setSendingTemplate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-bg-surface border-l border-border-default shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-default flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-lg flex items-center justify-center shrink-0">
              {(contact?.name || contact?.phone || 'WA').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {contact?.name || 'Unnamed Contact'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono text-text-secondary">{contact?.phone}</span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-1 hover:bg-bg-subtle rounded text-text-tertiary hover:text-text-primary transition-colors"
                  title="Copy Phone Number"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenChat && contact?.id && (
              <button
                type="button"
                onClick={() => onOpenChat(contact.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-border-default text-xs font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <span>Notes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-bg-subtle text-[10px] text-text-secondary">
              {notes.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors shrink-0 ${
              activeTab === 'fields'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Custom Fields
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'deals'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <span>Deals</span>
            <span className="px-1.5 py-0.2 rounded-full bg-bg-subtle text-[10px] text-text-secondary">
              {(contact?.deals || []).length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`py-3 px-3 border-b-2 font-semibold transition-colors shrink-0 ${
              activeTab === 'template'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Send Template
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-text-tertiary text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Loading details...</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <ContactOverviewTab contact={contact} />
              )}

              {activeTab === 'notes' && (
                <ContactNotesTab
                  notes={notes}
                  newNote={newNote}
                  setNewNote={setNewNote}
                  savingNote={savingNote}
                  handleCreateNote={handleCreateNote}
                  handleDeleteNote={handleDeleteNote}
                />
              )}

              {activeTab === 'fields' && (
                <ContactFieldsTab
                  customFields={customFields}
                  customValues={customValues}
                  setCustomValues={setCustomValues}
                  savingFields={savingFields}
                  handleSaveFields={handleSaveFields}
                />
              )}

              {activeTab === 'deals' && (
                <ContactDealsTab deals={contact?.deals} />
              )}

              {activeTab === 'template' && (
                <ContactSendTemplateTab
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  templateSuccess={templateSuccess}
                  templateError={templateError}
                  sendingTemplate={sendingTemplate}
                  phone={contact?.phone}
                  handleSendTemplate={handleSendTemplate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
