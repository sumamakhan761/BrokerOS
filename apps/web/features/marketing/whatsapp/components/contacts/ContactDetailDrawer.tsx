'use client';

// ============================================================================
// BrokerOS — WhatsApp Contact Detail Drawer (Sheet / Slide-out)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Building2,
  Copy,
  Check,
  Tag as TagIcon,
  MessageSquare,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  Send,
  Loader2,
  Clock,
  User,
  Link2,
  AlertCircle,
} from 'lucide-react';
import type { WhatsAppContact, WhatsAppTemplate } from '../../types';

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
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-bg-base rounded-xl border border-border-default space-y-1">
                      <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </span>
                      <p className="font-medium text-text-primary">
                        {contact?.email || 'No email provided'}
                      </p>
                    </div>

                    <div className="p-3 bg-bg-base rounded-xl border border-border-default space-y-1">
                      <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> Organization
                      </span>
                      <p className="font-medium text-text-primary">
                        {contact?.company || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <TagIcon className="w-3.5 h-3.5 text-text-tertiary" />
                      <span>Contact Tags</span>
                    </h4>
                    {contact?.tags && contact.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.map((t: any) => (
                          <span
                            key={t.tagId || t.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-600 border border-brand-500/20"
                          >
                            {t.tag?.name || 'Tag'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-tertiary italic">No tags attached</p>
                    )}
                  </div>

                  {/* Linked CRM Lead */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-text-tertiary" />
                      <span>Linked Real Estate Lead</span>
                    </h4>
                    {contact?.lead ? (
                      <div className="p-4 bg-bg-base rounded-xl border border-border-default space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-text-primary">
                            {contact.lead.name || 'CRM Lead'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">
                            {contact.lead.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-tertiary">
                          Temperature: <strong className="text-text-secondary">{contact.lead.temperature || 'WARM'}</strong>
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-text-tertiary italic">
                        Not linked to a CRM lead record.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: NOTES */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleCreateNote} className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Add an internal note about this customer..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full p-3 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 resize-none transition-colors"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingNote || !newNote.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-2xs"
                      >
                        {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>Add Note</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3 pt-2">
                    {notes.length === 0 ? (
                      <p className="text-center py-8 text-xs text-text-tertiary italic">
                        No notes recorded yet.
                      </p>
                    ) : (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3.5 bg-bg-base border border-border-default rounded-xl space-y-2 group"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-text-primary flex items-center gap-1.5">
                              <User className="w-3 h-3 text-brand-500" />
                              {note.author?.name || 'Agent'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-text-tertiary">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-opacity"
                                title="Delete note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM FIELDS */}
              {activeTab === 'fields' && (
                <div className="space-y-4">
                  {customFields.length === 0 ? (
                    <p className="text-center py-8 text-xs text-text-tertiary italic">
                      No custom fields configured. Add custom fields in Settings.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customFields.map((field) => (
                        <div key={field.id}>
                          <label className="block text-xs font-medium text-text-secondary mb-1">
                            {field.name}
                          </label>
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={customValues[field.id] || ''}
                            onChange={(e) =>
                              setCustomValues({
                                ...customValues,
                                [field.id]: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
                          />
                        </div>
                      ))}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSaveFields}
                          disabled={savingFields}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {savingFields ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <span>Save Custom Values</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DEALS */}
              {activeTab === 'deals' && (
                <div className="space-y-3">
                  {(contact?.deals || []).length === 0 ? (
                    <p className="text-center py-8 text-xs text-text-tertiary italic">
                      No WhatsApp CRM deals associated with this contact yet.
                    </p>
                  ) : (
                    contact.deals.map((deal: any) => (
                      <div
                        key={deal.id}
                        className="p-4 bg-bg-base border border-border-default rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-xs text-text-primary">{deal.title}</h5>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600">
                            {deal.stage?.name || 'Stage'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-emerald-600">
                          {deal.currency || 'USD'} {Number(deal.value || 0).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: SEND TEMPLATE */}
              {activeTab === 'template' && (
                <div className="space-y-4">
                  {templateSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>{templateSuccess}</span>
                    </div>
                  )}

                  {templateError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{templateError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Select Approved Meta HSM Template
                    </label>
                    <select
                      value={selectedTemplate?.name || ''}
                      onChange={(e) => {
                        const tpl = templates.find((t) => t.name === e.target.value);
                        setSelectedTemplate(tpl || null);
                      }}
                      className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
                    >
                      <option value="">Choose a template...</option>
                      {templates.map((tpl) => (
                        <option key={tpl.id} value={tpl.name}>
                          {tpl.name} ({tpl.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTemplate && (
                    <div className="p-4 bg-bg-base rounded-2xl border border-border-default space-y-3">
                      <span className="text-[11px] font-semibold text-text-tertiary uppercase">
                        Template Preview
                      </span>
                      {selectedTemplate.headerText && (
                        <p className="font-bold text-xs text-text-primary">
                          {selectedTemplate.headerText}
                        </p>
                      )}
                      <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                        {selectedTemplate.bodyText}
                      </p>
                      {selectedTemplate.footerText && (
                        <p className="text-[11px] text-text-tertiary">
                          {selectedTemplate.footerText}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSendTemplate}
                      disabled={!selectedTemplate || sendingTemplate}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-2xs"
                    >
                      {sendingTemplate ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send to {contact?.phone}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
