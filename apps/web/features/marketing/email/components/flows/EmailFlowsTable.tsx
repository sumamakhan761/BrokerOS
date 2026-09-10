// ============================================================================
// BrokerOS — Email Interactive Flows Table & Templates Gallery
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Workflow,
  Plus,
  Search,
  Play,
  Pause,
  Layers,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Globe,
  Radio,
  Tag,
  Bot,
  Mail,
  Building2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import type { EmailFlow } from '@/features/marketing/types';
import {
  EMAIL_FLOW_TEMPLATES,
  EmailFlowTemplate,
} from './templates/email-flow-templates';

export function EmailFlowsTable() {
  const router = useRouter();
  const [flows, setFlows] = useState<EmailFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadFlows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFlows(data.items || []);
      } else {
        toast.error('Failed to load email flows');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading flows');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleCreateBlankFlow = async () => {
    try {
      setCreating(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Untitled Email Flow',
          description: 'Custom trigger and reply sequence',
          triggerType: 'keyword_match',
          triggerConfig: { keywords: ['info', 'details'], matchType: 'contains' },
          isGlobal: true,
          nodes: [
            {
              nodeKey: 'reply_1',
              nodeType: 'send_email',
              config: {
                subject: 'Thank you for your interest',
                bodyHtml: '<p>Hello {{lead_name}}, thank you for getting in touch!</p>',
              },
              positionX: 100,
              positionY: 100,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(', ')
          : (errData.message || 'Failed to create flow');
        throw new Error(msg);
      }
      const data = await res.json();
      toast.success('Flow created');
      router.push(`/dashboard/marketing/email/flows/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating blank flow');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromTemplate = async (tpl: EmailFlowTemplate) => {
    try {
      setCreating(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: tpl.name,
          description: tpl.description,
          triggerType: tpl.triggerType,
          triggerConfig: tpl.triggerConfig,
          isGlobal: true,
          nodes: tpl.nodes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message)
          ? errData.message.join(', ')
          : (errData.message || 'Failed to create flow from template');
        throw new Error(msg);
      }
      const data = await res.json();
      toast.success(`Created "${tpl.name}" from template`);
      setTemplateModalOpen(false);
      router.push(`/dashboard/marketing/email/flows/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Error creating from template');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (flow: EmailFlow) => {
    const nextStatus = flow.status === 'active' ? 'draft' : 'active';
    try {
      const res = await fetch(`${baseUrl}/api/marketing/email/flows/${flow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update status');
      }
      toast.success(nextStatus === 'active' ? 'Flow activated' : 'Flow paused');
      loadFlows();
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleDuplicate = async (flowId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/email/flows/${flowId}/clone`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to clone flow');
      }
      toast.success('Flow cloned successfully');
      loadFlows();
    } catch (err: any) {
      toast.error(err.message || 'Error cloning flow');
    }
  };

  const handleDelete = async (flowId: string) => {
    if (!confirm('Are you sure you want to delete this flow automation?')) return;
    try {
      setDeletingId(flowId);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows/${flowId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete flow');
      toast.success('Flow deleted');
      loadFlows();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting flow');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFlows = flows.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">2-Way Email Automation Flows</h3>
              <p className="text-xs text-text-tertiary mt-0.5">
                Autonomous multi-step sequences. Detect reply keywords, auto-respond via Groq AI, add prospect tags, and route high-intent leads to Pre-Sales Managers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setTemplateModalOpen(true)}
              variant="outline"
              className="gap-2 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Template Presets</span>
            </Button>
            <Button
              onClick={handleCreateBlankFlow}
              disabled={creating}
              className="gap-2 text-xs font-semibold shadow-xs"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Create Flow</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active flows by name or description..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Flows Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-bg-surface border border-border-default rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
          <p className="text-xs text-text-tertiary">Loading automation flows...</p>
        </div>
      ) : filteredFlows.length === 0 ? (
        <div className="text-center py-12 px-4 bg-bg-surface border border-dashed border-border-default rounded-2xl">
          <Workflow className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-30" />
          <h4 className="text-sm font-semibold text-text-primary">No email flows created yet</h4>
          <p className="text-xs text-text-secondary mt-1 max-w-md mx-auto">
            Build your first 2-way email autoresponder to handle inquiries for site visits, pricing sheets, or autonomous Groq AI concierge.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              onClick={() => setTemplateModalOpen(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Explore Templates</span>
            </Button>
            <Button
              onClick={handleCreateBlankFlow}
              size="sm"
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Blank Flow</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredFlows.map((flow) => {
            const isActive = flow.status === 'active';
            const keywords = flow.triggerConfig?.keywords || [];

            return (
              <div
                key={flow.id}
                className="bg-bg-surface border border-border-default rounded-2xl p-5 shadow-2xs hover:border-border-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/dashboard/marketing/email/flows/${flow.id}`}
                      className="text-sm font-bold text-text-primary hover:text-brand-600 transition-colors flex items-center gap-1.5"
                    >
                      <span>{flow.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                    </Link>

                    {/* Status Pill */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(flow)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      {isActive ? 'Active' : 'Draft'}
                    </button>

                    {/* Scope Badge */}
                    <span className="text-[11px] font-medium text-text-tertiary bg-bg-subtle px-2 py-0.5 rounded-md flex items-center gap-1">
                      {flow.isGlobal ? (
                        <>
                          <Globe className="w-3 h-3 text-blue-500" />
                          <span>Global (All Broadcasts)</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3 h-3 text-purple-500" />
                          <span>{flow.campaignIds?.length || 0} Campaign(s)</span>
                        </>
                      )}
                    </span>
                  </div>

                  {flow.description && (
                    <p className="text-xs text-text-secondary line-clamp-1">{flow.description}</p>
                  )}

                  {/* Trigger & Node Stats */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-text-secondary">Trigger:</span>
                      {flow.triggerType === 'keyword_match' ? (
                        <span className="font-mono text-purple-600">
                          Keywords ({keywords.slice(0, 3).join(', ')}
                          {keywords.length > 3 ? '...' : ''})
                        </span>
                      ) : (
                        <span className="text-brand-600 font-medium">Any Inbound Reply</span>
                      )}
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{flow._count?.nodes ?? flow.nodes?.length ?? 0} Steps</span>
                    </span>

                    <span>•</span>

                    <span>{flow._count?.runs ?? 0} Executions</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Link href={`/dashboard/marketing/email/flows/${flow.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Canvas</span>
                    </Button>
                  </Link>

                  <Button
                    onClick={() => handleDuplicate(flow.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-text-tertiary hover:text-text-primary"
                    title="Clone Flow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    onClick={() => handleDelete(flow.id)}
                    disabled={deletingId === flow.id}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    title="Delete Flow"
                  >
                    {deletingId === flow.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Template Presets Gallery Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-bg-surface border border-border-default rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    Email Flow Automation Presets
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    Select a battle-tested sequence to jumpstart your 2-way lead conversion.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EMAIL_FLOW_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl border border-border-default bg-bg-subtle hover:border-brand-500 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600">
                        {tpl.badge}
                      </span>
                      <span className="text-[11px] text-text-tertiary font-mono">
                        {tpl.nodes.length} Steps
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary group-hover:text-brand-600 transition-colors">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={creating}
                    size="sm"
                    className="w-full gap-1.5 text-xs font-semibold mt-2"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
