'use client';

import React, { useState } from 'react';
import { FileText, X, AlertCircle, Loader2 } from 'lucide-react';

interface TemplateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  accountId?: string;
  baseUrl: string;
}

export const TemplateCreateModal: React.FC<TemplateCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountId,
  baseUrl,
}) => {
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('MARKETING');
  const [formLanguage, setFormLanguage] = useState('en_US');
  const [formHeaderText, setFormHeaderText] = useState('');
  const [formBodyText, setFormBodyText] = useState(
    'Hello {{1}}, thank you for inquiring about our luxury residences at {{2}}. Would you like to schedule an exclusive VIP walkthrough?',
  );
  const [formFooterText, setFormFooterText] = useState('Reply STOP to unsubscribe');
  const [formButtonText, setFormButtonText] = useState('Schedule Tour');

  if (!isOpen) return null;

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBodyText.trim()) {
      setCreateError('Template name and body text are required.');
      return;
    }

    const sanitizedName = formName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    try {
      setSavingTemplate(true);
      setCreateError(null);

      const payload: any = {
        accountId,
        name: sanitizedName,
        category: formCategory,
        language: formLanguage,
        bodyText: formBodyText.trim(),
      };

      if (formHeaderText.trim()) payload.headerText = formHeaderText.trim();
      if (formFooterText.trim()) payload.footerText = formFooterText.trim();
      if (formButtonText.trim()) {
        payload.buttons = [
          {
            type: 'QUICK_REPLY',
            text: formButtonText.trim(),
          },
        ];
      }

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit template to Meta');
      }

      onClose();
      await onSuccess();
    } catch (err: any) {
      setCreateError(err.message || 'Error submitting template');
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <h4 className="font-semibold text-text-primary text-sm">
              Create Meta WhatsApp HSM Template
            </h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Side */}
          <form id="template-create-form" onSubmit={handleCreateTemplate} className="space-y-4">
            {createError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Template Name (lowercase_snake_case)
              </label>
              <input
                type="text"
                placeholder="e.g. site_visit_invitation_v1"
                value={formName}
                onChange={(e) =>
                  setFormName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
                }
                className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs font-mono text-text-primary focus:outline-hidden focus:border-brand-500"
                required
              />
              <p className="text-[10px] text-text-tertiary mt-1">
                Meta requires lowercase alphanumeric characters and underscores only.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
                >
                  <option value="MARKETING">MARKETING</option>
                  <option value="UTILITY">UTILITY</option>
                  <option value="AUTHENTICATION">AUTHENTICATION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Language Code
                </label>
                <input
                  type="text"
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  placeholder="en_US"
                  className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs font-mono text-text-primary focus:outline-hidden focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Header Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Exclusive Project Preview"
                value={formHeaderText}
                onChange={(e) => setFormHeaderText(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Body Text (Supports placeholders like {'{{1}}'}, {'{{2}}'})
              </label>
              <textarea
                rows={4}
                value={formBodyText}
                onChange={(e) => setFormBodyText(e.target.value)}
                className="w-full p-3 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 resize-none leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Footer Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Reply STOP to unsubscribe"
                value={formFooterText}
                onChange={(e) => setFormFooterText(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Quick Reply Button Label (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Schedule VIP Visit"
                value={formButtonText}
                onChange={(e) => setFormButtonText(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
              />
            </div>
          </form>

          {/* Live Mobile Device Mockup Side */}
          <div className="flex flex-col items-center justify-center p-4 bg-bg-base rounded-xl border border-border-default">
            <span className="text-[11px] font-semibold text-text-tertiary mb-3 uppercase tracking-wider">
              Live Phone Mockup Preview
            </span>
            <div className="w-full max-w-[280px] bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-3 shadow-md space-y-2 text-xs">
              {formHeaderText && (
                <p className="font-bold text-text-primary">{formHeaderText}</p>
              )}
              <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                {formBodyText || 'Your template message body will render here...'}
              </p>
              {formFooterText && (
                <p className="text-[10px] text-text-tertiary">{formFooterText}</p>
              )}
              {formButtonText && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <div className="w-full text-center py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-xs border border-emerald-500/30">
                    {formButtonText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border-default bg-bg-subtle/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-bg-subtle hover:bg-bg-muted border border-border-default rounded-xl text-xs font-semibold text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="template-create-form"
            disabled={savingTemplate}
            className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
          >
            {savingTemplate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Submit to Meta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
