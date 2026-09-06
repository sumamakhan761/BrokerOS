'use client';

// ============================================================================
// BrokerOS — WhatsApp Contact Form Modal (Add / Edit Contact)
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Building2,
  Tag as TagIcon,
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { WhatsAppContact, WhatsAppTag } from '../../types';

interface ContactFormModalProps {
  open: boolean;
  onClose: () => void;
  contact?: WhatsAppContact | null;
  accountId?: string;
  onSaved: (savedContact: WhatsAppContact) => void;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  open,
  onClose,
  contact,
  accountId,
  onSaved,
}) => {
  const isEdit = !!contact;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [leadId, setLeadId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<WhatsAppTag[]>([]);
  const [availableLeads, setAvailableLeads] = useState<Array<{ id: string; name?: string; phone?: string }>>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Initialize or reset form when modal opens or contact changes
  useEffect(() => {
    if (open) {
      if (contact) {
        setName(contact.name || '');
        setPhone(contact.phone || '');
        setEmail(contact.email || '');
        setCompany(contact.company || '');
        setLeadId((contact as any).leadId || '');
        setSelectedTagIds(contact.tags?.map((t: any) => t.tagId || t.tag?.id || t.id) || []);
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setCompany('');
        setLeadId('');
        setSelectedTagIds([]);
      }
      setError(null);
    }
  }, [open, contact]);

  // Load available tags and CRM leads
  useEffect(() => {
    if (!open) return;

    async function loadMeta() {
      try {
        const [tagsRes, leadsRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/tags${accountId ? `?accountId=${accountId}` : ''}`),
          fetch(`${baseUrl}/api/leads?limit=50`),
        ]);

        if (tagsRes.ok) {
          const tData = await tagsRes.json();
          setAvailableTags(Array.isArray(tData) ? tData : []);
        }
        if (leadsRes.ok) {
          const lData = await leadsRes.json();
          setAvailableLeads(lData.items || lData.leads || []);
        }
      } catch (err) {
        console.error('Failed to load contact meta options:', err);
      }
    }

    loadMeta();
  }, [open, baseUrl, accountId]);

  if (!open) return null;

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      setError('Phone number is required (E.164 format e.g. +1234567890).');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const endpoint = isEdit
        ? `${baseUrl}/api/marketing/whatsapp/contacts/${contact.id}`
        : `${baseUrl}/api/marketing/whatsapp/contacts`;

      const method = isEdit ? 'PATCH' : 'POST';

      const payload: any = {
        phone: phone.trim(),
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        leadId: leadId.trim() || null,
      };
      if (accountId && !isEdit) {
        payload.accountId = accountId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to save contact');
      }

      const saved = await res.json();

      // Sync selected tags
      const currentTagIds = (contact?.tags || []).map((t: any) => t.tagId || t.tag?.id || t.id);
      const tagsToAdd = selectedTagIds.filter((id) => !currentTagIds.includes(id));
      const tagsToRemove = currentTagIds.filter((id: string) => !selectedTagIds.includes(id));

      await Promise.all([
        ...tagsToAdd.map((tagId) =>
          fetch(`${baseUrl}/api/marketing/whatsapp/contacts/${saved.id}/tags/${tagId}`, {
            method: 'POST',
          }),
        ),
        ...tagsToRemove.map((tagId) =>
          fetch(`${baseUrl}/api/marketing/whatsapp/contacts/${saved.id}/tags/${tagId}`, {
            method: 'DELETE',
          }),
        ),
      ]);

      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error saving contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">
                {isEdit ? 'Edit WhatsApp Contact' : 'Add New WhatsApp Contact'}
              </h3>
              <p className="text-[11px] text-text-tertiary">
                {isEdit
                  ? 'Update contact details, tags, and CRM links'
                  : 'Register an opted-in contact number for customer messaging'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-bg-subtle rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-text-tertiary absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 font-mono transition-colors"
              />
            </div>
            <p className="text-[10px] text-text-tertiary mt-1">
              Must include country code (e.g. +1 for US, +91 for India).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-tertiary absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Company / Organization
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-text-tertiary absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-tertiary absolute left-3.5 top-2.5" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* CRM Lead Connection */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Link to CRM Lead (Optional)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-text-tertiary absolute left-3.5 top-2.5" />
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 transition-colors appearance-none"
              >
                <option value="">No linked lead</option>
                {availableLeads.map((ld) => (
                  <option key={ld.id} value={ld.id}>
                    {ld.name || 'Unnamed Lead'} {ld.phone ? `(${ld.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Picker */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-text-tertiary" />
              <span>Contact Tags</span>
            </label>
            {availableTags.length === 0 ? (
              <p className="text-[11px] text-text-tertiary italic">
                No tags created yet. You can create tags in Settings.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                          : 'bg-bg-base text-text-secondary border-border-default hover:border-text-secondary'
                      }`}
                    >
                      <span>{tag.name}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:bg-bg-subtle border border-border-default transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Contact' : 'Save Contact'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
