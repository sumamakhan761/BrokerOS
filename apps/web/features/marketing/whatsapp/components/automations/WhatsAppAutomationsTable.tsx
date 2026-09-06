// ============================================================================
// BrokerOS — WhatsApp Automations Workflows Table
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Plus,
  Search,
  Play,
  Pause,
  Layers,
  Edit2,
  Trash2,
  Copy,
  History,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { AUTOMATION_TEMPLATES } from '@brokeros/constants';
import type { WhatsAppAutomation } from '../../types';

interface WhatsAppAutomationsTableProps {
  accountId?: string;
}

export const WhatsAppAutomationsTable: React.FC<WhatsAppAutomationsTableProps> = ({
  accountId,
}) => {
  const router = useRouter();
  const [automations, setAutomations] = useState<WhatsAppAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadAutomations = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (accountId) q.set('accountId', accountId);

      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/automations?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAutomations(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAutomations();
  }, [accountId]);

  const toggleStatus = async (auto: WhatsAppAutomation) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/marketing/whatsapp/automations/${auto.id}/toggle`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !auto.isActive }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setAutomations((prev) =>
          prev.map((a) => (a.id === auto.id ? { ...a, isActive: updated.isActive } : a)),
        );
        toast.success(updated.isActive ? 'Automation activated' : 'Automation paused');
      }
    } catch (err) {
      toast.error('Error toggling automation status');
    }
  };

  const deleteAutomation = async (id: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/automations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAutomations((prev) => prev.filter((a) => a.id !== id));
        toast.success('Automation deleted');
        setDeleteConfirmId(null);
      } else {
        toast.error('Failed to delete automation');
      }
    } catch {
      toast.error('Error deleting automation');
    }
  };

  const duplicateAutomation = async (auto: WhatsAppAutomation) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/automations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${auto.name} (Copy)`,
          triggerType: auto.triggerType,
          triggerConfig: auto.triggerConfig,
          isActive: false,
          steps: (auto.steps || []).map((s: any, idx: number) => ({
            stepType: s.stepType || s.step_type,
            stepConfig: s.stepConfig || s.step_config,
            position: idx,
            branch: s.branch,
          })),
        }),
      });
      if (res.ok) {
        toast.success('Automation duplicated');
        loadAutomations();
      } else {
        toast.error('Failed to duplicate automation');
      }
    } catch {
      toast.error('Error duplicating automation');
    }
  };

  const filtered = automations.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.triggerType.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Template Quick-Start Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Pre-Built Workflow Templates
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(AUTOMATION_TEMPLATES).map(([key, t]) => (
            <div
              key={key}
              className="flex flex-col justify-between rounded-xl border border-border-default bg-bg-surface p-4 shadow-xs hover:border-brand-500/50 hover:shadow-sm transition-all"
            >
              <div>
                <span className="inline-block rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600 mb-2">
                  Template
                </span>
                <h4 className="text-xs font-bold text-text-primary">{t.name}</h4>
                <p className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/marketing/whatsapp/automations/new?template=${key}`)
                }
                className="mt-3 flex items-center justify-between text-xs font-semibold text-brand-600 hover:text-brand-700 pt-2 border-t border-border-default"
              >
                <span>Use Template</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search automations by name or trigger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-subtle border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard/marketing/whatsapp/automations/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation</span>
        </button>
      </div>

      {/* Automations Table Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle text-text-secondary font-semibold uppercase tracking-wider text-[11px] border-b border-border-default">
              <tr>
                <th className="px-6 py-3.5">Automation Name</th>
                <th className="px-6 py-3.5">Trigger Event</th>
                <th className="px-6 py-3.5">Steps</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Executions</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    Loading automations...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    No automations configured yet. Pick a template above or click "New Automation" to start.
                  </td>
                </tr>
              ) : (
                filtered.map((auto) => (
                  <tr
                    key={auto.id}
                    className="hover:bg-bg-subtle/50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/marketing/whatsapp/automations/${auto.id}/edit`)
                    }
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text-primary text-xs">{auto.name}</p>
                      {auto.description && (
                        <p className="text-[11px] text-text-muted mt-0.5 truncate max-w-xs">
                          {auto.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-bg-subtle text-text-secondary border border-border-default">
                        {auto.triggerType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Layers className="w-3.5 h-3.5 text-text-muted" />
                        <span>{auto.steps?.length || 0} steps</span>
                      </div>
                    </td>

                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleStatus(auto)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${auto.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 hover:bg-zinc-500/20'
                          }`}
                      >
                        {auto.isActive ? (
                          <>
                            <Play className="w-3 h-3 fill-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/marketing/whatsapp/automations/${auto.id}/logs`)
                        }
                        className="inline-flex items-center gap-1.5 text-brand-600 font-semibold hover:underline"
                        title="View Execution Run Logs"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>{auto._count?.logs?.toLocaleString() || 0} runs</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateAutomation(auto)}
                          className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-subtle transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/marketing/whatsapp/automations/${auto.id}/edit`)
                          }
                          className="p-1.5 text-text-muted hover:text-brand-600 rounded-lg hover:bg-bg-subtle transition-colors"
                          title="Edit Workflow"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(auto.id)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Automation"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl">
            <h3 className="text-base font-bold text-text-primary">Delete Automation?</h3>
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete this automation? Its triggers, steps, and past run logs will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteAutomation(deleteConfirmId)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
