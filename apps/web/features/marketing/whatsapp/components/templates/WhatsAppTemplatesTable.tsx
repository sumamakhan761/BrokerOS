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
  Plus,
  Trash2,
  Loader2,
  Eye,
} from 'lucide-react';
import type { WhatsAppTemplate } from '../../types';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import { TemplateCreateModal } from './TemplateCreateModal';

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
            onClick={() => setIsCreating(true)}
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
                        const cat = (
                          tmpl.category || (tmpl.name === 'hello_world' ? 'UTILITY' : 'MARKETING')
                        ).toUpperCase();
                        let badgeStyle = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                        if (cat === 'UTILITY') {
                          badgeStyle = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                        } else if (cat === 'AUTHENTICATION') {
                          badgeStyle = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                        }
                        return (
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider ${badgeStyle}`}
                          >
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
      <TemplatePreviewModal
        selectedTemplate={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />

      {/* Create Template Modal */}
      <TemplateCreateModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSuccess={loadTemplates}
        accountId={accountId}
        baseUrl={baseUrl}
      />
    </div>
  );
};
