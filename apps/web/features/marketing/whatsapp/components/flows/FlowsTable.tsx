// ============================================================================
// BrokerOS — WhatsApp Interactive Flow Bots Table
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Workflow,
  Plus,
  Search,
  Play,
  Pause,
  Layers,
  Edit2,
  Trash2,
  History,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface WhatsAppFlowItem {
  id: string;
  name: string;
  description?: string | null;
  status: 'draft' | 'active' | 'archived';
  triggerType: string;
  triggerConfig?: any;
  nodesCount?: number;
  runsCount?: number;
  createdAt: string;
  updatedAt: string;
}

import {
  FLOW_TEMPLATES,
  getNodesForTemplate,
} from './templates/flow-templates-registry';

export function FlowsTable({ accountId }: { accountId?: string }) {
  const router = useRouter();
  const [flows, setFlows] = useState<WhatsAppFlowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function loadFlows() {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (accountId) q.set('accountId', accountId);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/flows?${q.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFlows(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load flows:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFlows();
  }, [accountId]);

  async function handleCreate(templateName?: string, templateSlug?: string) {
    const flowName = templateName || newName.trim();
    if (!flowName) return;

    setCreating(true);
    try {
      const templateData = getNodesForTemplate(templateSlug || templateName);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          accountId,
          name: flowName,
          triggerType: templateData.triggerType,
          triggerConfig: templateData.triggerConfig,
          nodes: templateData.nodes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Failed to create flow');
        throw new Error(msg);
      }

      const created = await res.json();
      toast.success('Flow created successfully');
      setCreateModalOpen(false);
      setNewName('');
      router.push(`/dashboard/marketing/whatsapp/flows/${created.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating flow');
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(flow: WhatsAppFlowItem) {
    const nextStatus = flow.status === 'active' ? 'draft' : 'active';
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/flows/${flow.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setFlows((prev) =>
          prev.map((f) => (f.id === flow.id ? { ...f, status: nextStatus } : f)),
        );
        toast.success(nextStatus === 'active' ? 'Flow activated' : 'Flow set to draft');
      }
    } catch {
      toast.error('Failed to toggle status');
    }
  }

  async function handleDelete(id: string) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/flows/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setFlows((prev) => prev.filter((f) => f.id !== id));
        toast.success('Flow deleted');
        setDeleteConfirmId(null);
      } else {
        toast.error('Failed to delete flow');
      }
    } catch {
      toast.error('Error deleting flow');
    }
  }

  const filtered = flows.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.triggerType?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Template Quick-Start Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
            Pre-Built Bot Templates
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FLOW_TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.slug}
                className="flex flex-col justify-between rounded-xl border border-border-default bg-bg-surface p-4 shadow-xs hover:border-brand-500/50 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                      <Icon className="h-3 w-3" />
                      {t.nodes} nodes
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-text-primary">{t.name}</h4>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreate(t.name, t.slug)}
                  className="mt-3 flex items-center justify-between text-xs font-semibold text-brand-600 hover:text-brand-700 pt-2 border-t border-border-default"
                >
                  <span>Build with this template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search flow bots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-subtle border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-xs w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Flow Bot</span>
        </button>
      </div>

      {/* Flows Table Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle text-text-secondary font-semibold uppercase tracking-wider text-[11px] border-b border-border-default">
              <tr>
                <th className="px-6 py-3.5">Flow Name</th>
                <th className="px-6 py-3.5">Trigger</th>
                <th className="px-6 py-3.5">Nodes</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Execution Runs</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    Loading flows...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    No flow bots configured yet. Click "New Flow Bot" or choose a template above.
                  </td>
                </tr>
              ) : (
                filtered.map((flow) => (
                  <tr
                    key={flow.id}
                    className="hover:bg-bg-subtle/50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/marketing/whatsapp/flows/${flow.id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text-primary text-xs hover:text-brand-600 transition-colors">
                        {flow.name}
                      </p>
                      {flow.description && (
                        <p className="text-[11px] text-text-muted mt-0.5 truncate max-w-xs">
                          {flow.description}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-bg-subtle text-text-secondary border border-border-default">
                        {flow.triggerType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Layers className="w-3.5 h-3.5 text-text-muted" />
                        <span>{flow.nodesCount || 0} nodes</span>
                      </div>
                    </td>

                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleStatus(flow)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${flow.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 hover:bg-zinc-500/20'
                          }`}
                      >
                        {flow.status === 'active' ? (
                          <>
                            <Play className="w-3 h-3 fill-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/dashboard/marketing/whatsapp/flows/${flow.id}/runs`)
                        }
                        className="inline-flex items-center gap-1.5 text-brand-600 font-semibold hover:underline"
                        title="View Execution History"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>{flow.runsCount || 0} runs</span>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/marketing/whatsapp/flows/${flow.id}`)
                          }
                          className="p-1.5 text-text-muted hover:text-brand-600 rounded-lg hover:bg-bg-subtle transition-colors"
                          title="Edit Flow Canvas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(flow.id)}
                          className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Flow"
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

      {/* Create Flow Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-text-primary">Create New Flow Bot</h3>
            <p className="text-xs text-text-muted">
              Give your flow bot a name. You can configure interactive message nodes, buttons, input collection, and branching rules on the next screen.
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-primary block">Flow Bot Name *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Luxury Penthouse Discovery Bot"
                className="text-xs bg-bg-subtle"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleCreate()}
                disabled={creating || !newName.trim()}
                className="text-xs bg-brand-600 hover:bg-brand-700 text-white"
              >
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                Create & Open Builder
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl">
            <h3 className="text-base font-bold text-text-primary">Delete Flow Bot?</h3>
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete this flow? Its graph nodes, interactive connections, and past run events will be permanently removed.
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
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
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
}
