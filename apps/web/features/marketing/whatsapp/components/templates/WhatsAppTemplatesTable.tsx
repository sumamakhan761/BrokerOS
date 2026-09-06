// ============================================================================
// BrokerOS — WhatsApp Templates Table & Meta Creator / Sync
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Plus,
  Trash2,
  X,
  Check,
  Loader2,
  Eye,
  Sparkles,
} from 'lucide-react';
import type { WhatsAppTemplate } from '../../types';

interface WhatsAppTemplatesTableProps {
  accountId?: string;
}

export const WhatsAppTemplatesTable: React.FC<WhatsAppTemplatesTableProps> = ({
  accountId,
}) => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  // Template Creator Modal state
  const [isCreating, setIsCreating] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('MARKETING');
  const [formLanguage, setFormLanguage] = useState('en_US');
  const [formHeaderText, setFormHeaderText] = useState('');
  const [formBodyText, setFormBodyText] = useState('');
  const [formFooterText, setFormFooterText] = useState('');
  const [formButtonText, setFormButtonText] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (accountId) q.set('accountId', accountId);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/templates?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [baseUrl, accountId]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/templates/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountId ? { accountId } : {}),
      });
      if (res.ok) {
        await loadTemplates();
      }
    } catch (err) {
      console.error('Template sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormCategory('MARKETING');
    setFormLanguage('en_US');
    setFormHeaderText('');
    setFormBodyText('Hello {{1}}, thank you for inquiring about our luxury residences at {{2}}. Would you like to schedule an exclusive VIP walkthrough?');
    setFormFooterText('Reply STOP to unsubscribe');
    setFormButtonText('Schedule Tour');
    setCreateError(null);
    setIsCreating(true);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBodyText.trim()) {
      setCreateError('Template name and body text are required.');
      return;
    }

    // Sanitize template name: lowercase and underscores only
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

      setIsCreating(false);
      await loadTemplates();
    } catch (err: any) {
      setCreateError(err.message || 'Error submitting template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/templates/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const renderStatus = (status: WhatsAppTemplate['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>In Review</span>
          </span>
        );
      case 'REJECTED':
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <span>{status}</span>
          </span>
        );
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.bodyText.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Template</span>
          </button>

          <button
            type="button"
            disabled={syncing}
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-bg-subtle hover:bg-bg-muted border border-border-default text-text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync from Meta'}</span>
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle/80 text-text-secondary font-semibold uppercase tracking-wider text-[11px] border-b border-border-default">
              <tr>
                <th className="px-6 py-3.5">Template Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Language</th>
                <th className="px-6 py-3.5">Body Preview</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-tertiary">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-500" />
                    <span>Loading templates...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-tertiary">
                    No templates found. Click &quot;Create Template&quot; or &quot;Sync from Meta&quot;.
                  </td>
                </tr>
              ) : (
                filtered.map((tmpl) => (
                  <tr key={tmpl.id} className="hover:bg-bg-subtle/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-text-primary text-xs font-mono">
                        {tmpl.name}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {(() => {
                        const cat = (tmpl.category || (tmpl.name === 'hello_world' ? 'UTILITY' : 'MARKETING')).toUpperCase();
                        let badgeStyle = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                        if (cat === 'UTILITY') {
                          badgeStyle = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                        } else if (cat === 'AUTHENTICATION') {
                          badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                        }
                        return (
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider ${badgeStyle}`}>
                            {cat}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-4">{renderStatus(tmpl.status)}</td>

                    <td className="px-6 py-4 font-mono text-text-secondary">
                      {tmpl.language}
                    </td>

                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-text-secondary truncate">{tmpl.bodyText}</p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate(tmpl)}
                          className="p-1.5 bg-bg-subtle hover:bg-bg-muted border border-border-default rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                          title="Preview template"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tmpl.id)}
                          className="p-1.5 bg-bg-subtle hover:bg-red-500/10 border border-border-default rounded-lg text-xs font-medium text-text-secondary hover:text-red-500 transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template Preview Drawer / Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <div>
                <h3 className="font-semibold text-text-primary text-sm font-mono">
                  {selectedTemplate.name}
                </h3>
                <span className="text-[10px] text-text-tertiary uppercase">
                  {selectedTemplate.category} · {selectedTemplate.language}
                </span>
              </div>
              {renderStatus(selectedTemplate.status)}
            </div>

            {/* Simulated WhatsApp Bubble Preview */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-2">
              {selectedTemplate.headerText && (
                <p className="font-bold text-xs text-text-primary">
                  {selectedTemplate.headerText}
                </p>
              )}
              <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                {selectedTemplate.bodyText}
              </p>
              {selectedTemplate.footerText && (
                <p className="text-[10px] text-text-tertiary">
                  {selectedTemplate.footerText}
                </p>
              )}
              {Array.isArray(selectedTemplate.buttons) && selectedTemplate.buttons.length > 0 && (
                <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                  {selectedTemplate.buttons.map((btn: any, idx: number) => (
                    <div
                      key={idx}
                      className="w-full text-center py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-xs border border-emerald-500/30"
                    >
                      {btn.text || btn}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-bg-subtle hover:bg-bg-muted border border-border-default rounded-xl text-xs font-semibold text-text-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isCreating && (
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
                onClick={() => setIsCreating(false)}
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
                    onChange={(e) => setFormName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
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
                      <option value="MARKETING">Marketing</option>
                      <option value="UTILITY">Utility</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Language
                    </label>
                    <select
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
                    >
                      <option value="en_US">English (US)</option>
                      <option value="en_GB">English (UK)</option>
                      <option value="hi">Hindi</option>
                      <option value="ar">Arabic</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Header Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exclusive Invitation"
                    value={formHeaderText}
                    onChange={(e) => setFormHeaderText(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Body Text (Supports placeholders {'{{1}}'}, {'{{2}}'})
                  </label>
                  <textarea
                    rows={4}
                    value={formBodyText}
                    onChange={(e) => setFormBodyText(e.target.value)}
                    placeholder="Hello {{1}}, your booking at {{2}} has been confirmed."
                    className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500 leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Footer Text (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reply STOP to opt out"
                    value={formFooterText}
                    onChange={(e) => setFormFooterText(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Quick Reply Button (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Book Visit"
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </form>

              {/* Live Preview Side */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Real-time WhatsApp Message Preview</span>
                </div>

                <div className="p-5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2.5 shadow-inner">
                  {formHeaderText && (
                    <p className="font-bold text-xs text-text-primary border-b border-emerald-500/10 pb-1.5">
                      {formHeaderText}
                    </p>
                  )}
                  <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                    {formBodyText || 'Your template message body will appear here...'}
                  </p>
                  {formFooterText && (
                    <p className="text-[10px] text-text-tertiary pt-1">
                      {formFooterText}
                    </p>
                  )}
                  {formButtonText && (
                    <div className="pt-2 border-t border-emerald-500/20">
                      <div className="w-full py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-xs font-semibold text-emerald-400">
                        {formButtonText}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-bg-base border border-border-default rounded-xl text-[11px] text-text-tertiary leading-relaxed space-y-1">
                  <div className="font-semibold text-text-secondary">Meta Approval Guidelines:</div>
                  <div>• Use numbered variables sequentially: {'{{1}}'}, {'{{2}}'}.</div>
                  <div>• Marketing templates typically take 1-15 minutes for automated Meta review.</div>
                  <div>• Do not include offensive words or generic greetings without context.</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-default bg-bg-surface">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="template-create-form"
                disabled={savingTemplate}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {savingTemplate ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Submit to Meta Graph API</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
