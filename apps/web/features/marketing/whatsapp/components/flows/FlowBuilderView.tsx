// ============================================================================
// BrokerOS — WhatsApp Interactive Flow Builder View
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  PlayCircle,
  MessageCircle,
  ListChecks,
  ListPlus,
  Paperclip,
  Inbox,
  GitFork,
  Tag,
  UserPlus,
  Flag,
  Save,
  Loader2,
  History,
  Workflow,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type FlowNodeType =
  | 'start'
  | 'send_message'
  | 'send_buttons'
  | 'send_list'
  | 'send_media'
  | 'collect_input'
  | 'condition'
  | 'set_tag'
  | 'handoff'
  | 'end';

export interface FlowNode {
  id?: string;
  nodeKey: string;
  nodeType: FlowNodeType;
  config: Record<string, any>;
  positionX?: number;
  positionY?: number;
}

interface FlowData {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  triggerType: string;
  triggerConfig?: any;
  nodes: FlowNode[];
}

const NODE_TYPES_META: Record<
  FlowNodeType,
  { label: string; icon: any; color: string; desc: string }
> = {
  start: { label: 'Start Entry', icon: PlayCircle, color: 'text-emerald-500 bg-emerald-500/10 border-l-emerald-500', desc: 'Entry point of flow' },
  send_message: { label: 'Send Text Message', icon: MessageCircle, color: 'text-sky-500 bg-sky-500/10 border-l-sky-500', desc: 'Sends a text message' },
  send_buttons: { label: 'Send Quick Reply Buttons', icon: ListChecks, color: 'text-brand-600 bg-brand-500/10 border-l-brand-600', desc: 'Up to 3 reply buttons' },
  send_list: { label: 'Send List Menu', icon: ListPlus, color: 'text-indigo-500 bg-indigo-500/10 border-l-indigo-500', desc: 'Interactive dropdown list' },
  send_media: { label: 'Send Media (Image / PDF)', icon: Paperclip, color: 'text-cyan-500 bg-cyan-500/10 border-l-cyan-500', desc: 'Brochure or floor plan' },
  collect_input: { label: 'Ask Question & Save Reply', icon: Inbox, color: 'text-teal-500 bg-teal-500/10 border-l-teal-500', desc: 'Captures user response in CRM' },
  condition: { label: 'If / Else Branch', icon: GitFork, color: 'text-fuchsia-500 bg-fuchsia-500/10 border-l-fuchsia-500', desc: 'Branches on budget, tag, etc.' },
  set_tag: { label: 'Add / Remove Tag', icon: Tag, color: 'text-pink-500 bg-pink-500/10 border-l-pink-500', desc: 'Updates contact tags' },
  handoff: { label: 'Handoff to Human Agent', icon: UserPlus, color: 'text-amber-500 bg-amber-500/10 border-l-amber-500', desc: 'Transfers chat to sales exec' },
  end: { label: 'End Flow', icon: Flag, color: 'text-zinc-500 bg-zinc-500/10 border-l-zinc-500', desc: 'Terminates the workflow' },
};

export function FlowBuilderView({ id }: { id: string }) {
  const router = useRouter();
  const [flow, setFlow] = useState<FlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/flows/${id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Flow not found');
        const data = await res.json();
        setFlow(data);
      } catch (err: any) {
        setError(err.message || 'Error loading flow');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function updateNode(nodeKey: string, patch: Partial<FlowNode>) {
    if (!flow) return;
    setFlow({
      ...flow,
      nodes: flow.nodes.map((n) => (n.nodeKey === nodeKey ? { ...n, ...patch } : n)),
    });
  }

  function updateNodeConfig(nodeKey: string, cfgPatch: Record<string, any>) {
    if (!flow) return;
    setFlow({
      ...flow,
      nodes: flow.nodes.map((n) =>
        n.nodeKey === nodeKey ? { ...n, config: { ...n.config, ...cfgPatch } } : n,
      ),
    });
  }

  function addNode(type: FlowNodeType) {
    if (!flow) return;
    const key = `${type}_${Date.now().toString(36).slice(-4)}`;
    const newNode: FlowNode = {
      nodeKey: key,
      nodeType: type,
      config:
        type === 'send_message'
          ? { text: 'Hello! How can we assist you today?' }
          : type === 'send_buttons'
          ? {
              body: 'Please choose an option:',
              buttons: [
                { id: 'btn_1', title: '2 BHK Plans' },
                { id: 'btn_2', title: '3 BHK Luxury' },
              ],
            }
          : type === 'collect_input'
          ? { prompt: 'What is your expected investment budget?', var_name: 'budget' }
          : {},
      positionX: 100,
      positionY: (flow.nodes.length + 1) * 120,
    };
    setFlow({ ...flow, nodes: [...flow.nodes, newNode] });
  }

  function removeNode(nodeKey: string) {
    if (!flow) return;
    setFlow({ ...flow, nodes: flow.nodes.filter((n) => n.nodeKey !== nodeKey) });
  }

  async function save() {
    if (!flow) return;
    setSaving(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: flow.name,
          status: flow.status,
          triggerType: flow.triggerType,
          triggerConfig: flow.triggerConfig,
          nodes: flow.nodes,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Failed to save flow');
        throw new Error(msg);
      }
      toast.success('Flow bot saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error saving flow');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !flow) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-500 font-medium">{error || 'Flow not found'}</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/marketing/whatsapp/flows')}>
          Back to Flows
        </Button>
      </div>
    );
  }

  const allNodeKeys = flow.nodes.map((n) => n.nodeKey);

  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-default bg-bg-surface px-6 py-3.5 shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/dashboard/marketing/whatsapp/flows')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <input
              value={flow.name}
              onChange={(e) => setFlow({ ...flow, name: e.target.value })}
              placeholder="Flow bot name..."
              className="text-base font-bold text-text-primary bg-transparent focus:bg-bg-subtle rounded px-1.5 py-0.5 focus:outline-none w-full max-w-md"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/marketing/whatsapp/flows/${id}/runs`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-600 transition-colors px-2.5 py-1.5 rounded-lg border border-border-default bg-bg-surface"
          >
            <History className="h-3.5 w-3.5" />
            <span>Run History</span>
          </button>

          <div className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-1 text-xs font-semibold">
            <span>{flow.status === 'active' ? 'Active' : 'Draft'}</span>
            <Switch
              checked={flow.status === 'active'}
              onCheckedChange={(v) => setFlow({ ...flow, status: v ? 'active' : 'draft' })}
            />
          </div>

          <Button
            onClick={save}
            disabled={saving}
            className="bg-brand-600 text-white hover:bg-brand-700 text-xs h-8 font-semibold px-4"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save Flow
          </Button>
        </div>
      </header>

      {/* Main Flow Editor Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full py-8 px-4 space-y-6">
        {/* Trigger Banner */}
        <div className="rounded-2xl border border-brand-500/30 bg-bg-surface p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Trigger Settings
              </span>
              <h3 className="text-xs font-bold text-text-primary">
                Inbound Trigger: {flow.triggerType === 'keyword' ? 'Keyword Match' : 'First Inbound Message'}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={(flow.triggerConfig?.keywords || []).join(', ')}
              onChange={(e) =>
                setFlow({
                  ...flow,
                  triggerConfig: {
                    ...flow.triggerConfig,
                    keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                  },
                })
              }
              placeholder="Keywords (e.g. brochure, pricing, visit)"
              className="text-xs bg-bg-subtle w-64"
            />
          </div>
        </div>

        {/* Nodes Sequence */}
        <div className="space-y-4">
          {flow.nodes.map((node, idx) => {
            const meta = NODE_TYPES_META[node.nodeType] || NODE_TYPES_META.send_message;
            const Icon = meta.icon;

            return (
              <div
                key={node.nodeKey}
                className={cn(
                  'rounded-2xl border border-border-default bg-bg-surface p-4 shadow-xs border-l-4 transition-all',
                  meta.color.split(' ')[2],
                )}
              >
                {/* Node Card Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', meta.color.split(' ')[1], meta.color.split(' ')[0])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary">
                        {idx + 1}. {meta.label}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted ml-2">
                        ({node.nodeKey})
                      </span>
                    </div>
                  </div>

                  {node.nodeType !== 'start' && (
                    <button
                      type="button"
                      onClick={() => removeNode(node.nodeKey)}
                      className="text-text-muted hover:text-red-600 p-1 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Node Config Body */}
                <div className="space-y-3 pt-2 border-t border-border-default">
                  {node.nodeType === 'send_message' && (
                    <div>
                      <label className="text-xs font-medium text-text-muted block mb-1">Message Body:</label>
                      <Textarea
                        value={node.config.text || ''}
                        onChange={(e) => updateNodeConfig(node.nodeKey, { text: e.target.value })}
                        placeholder="Type message text..."
                        className="text-xs bg-bg-subtle min-h-16"
                      />
                    </div>
                  )}

                  {node.nodeType === 'send_buttons' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-text-muted block mb-1">Prompt Body:</label>
                        <Textarea
                          value={node.config.body || ''}
                          onChange={(e) => updateNodeConfig(node.nodeKey, { body: e.target.value })}
                          placeholder="Select an option:"
                          className="text-xs bg-bg-subtle min-h-14"
                        />
                      </div>
                      <label className="text-[11px] font-bold text-text-muted block">Buttons:</label>
                      {(node.config.buttons || []).map((btn: any, bIdx: number) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <Input
                            value={btn.title || ''}
                            onChange={(e) => {
                              const nextBtns = [...(node.config.buttons || [])];
                              nextBtns[bIdx] = { ...btn, title: e.target.value };
                              updateNodeConfig(node.nodeKey, { buttons: nextBtns });
                            }}
                            placeholder="Button label"
                            className="text-xs bg-bg-subtle flex-1"
                          />
                          <select
                            value={btn.next_node_key || ''}
                            onChange={(e) => {
                              const nextBtns = [...(node.config.buttons || [])];
                              nextBtns[bIdx] = { ...btn, next_node_key: e.target.value };
                              updateNodeConfig(node.nodeKey, { buttons: nextBtns });
                            }}
                            className="rounded-lg border border-border-default bg-bg-subtle px-2 py-1.5 text-xs text-text-primary"
                          >
                            <option value="">-- Then go to node --</option>
                            {allNodeKeys
                              .filter((k) => k !== node.nodeKey)
                              .map((k) => (
                                <option key={k} value={k}>
                                  {k}
                                </option>
                              ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {node.nodeType === 'collect_input' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-text-muted block mb-1">Question Prompt:</label>
                        <Input
                          value={node.config.prompt || ''}
                          onChange={(e) => updateNodeConfig(node.nodeKey, { prompt: e.target.value })}
                          placeholder="e.g. What is your preferred location?"
                          className="text-xs bg-bg-subtle"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted block mb-1">Save Answer As Variable:</label>
                        <Input
                          value={node.config.var_name || ''}
                          onChange={(e) => updateNodeConfig(node.nodeKey, { var_name: e.target.value })}
                          placeholder="e.g. preferred_location"
                          className="text-xs bg-bg-subtle font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {node.nodeType === 'condition' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs font-medium text-text-muted block mb-1">Variable:</label>
                        <Input
                          value={node.config.variable || ''}
                          onChange={(e) => updateNodeConfig(node.nodeKey, { variable: e.target.value })}
                          placeholder="budget"
                          className="text-xs bg-bg-subtle font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted block mb-1">If TRUE go to:</label>
                        <select
                          value={node.config.if_true_node_key || ''}
                          onChange={(e) => updateNodeConfig(node.nodeKey, { if_true_node_key: e.target.value })}
                          className="w-full rounded-lg border border-border-default bg-bg-subtle px-2 py-1.5 text-xs text-text-primary"
                        >
                          <option value="">-- Select node --</option>
                          {allNodeKeys.map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted block mb-1">If FALSE go to:</label>
                        <select
                          value={node.config.if_false_node_key || ''}
                          onChange={(e) => updateNodeConfig(node.nodeKey, { if_false_node_key: e.target.value })}
                          className="w-full rounded-lg border border-border-default bg-bg-subtle px-2 py-1.5 text-xs text-text-primary"
                        >
                          <option value="">-- Select node --</option>
                          {allNodeKeys.map((k) => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* General Next Node transition for linear nodes */}
                  {node.nodeType !== 'send_buttons' && node.nodeType !== 'condition' && node.nodeType !== 'end' && (
                    <div className="pt-2 flex items-center gap-2">
                      <ArrowDown className="h-3.5 w-3.5 text-text-muted" />
                      <span className="text-[11px] font-medium text-text-muted">Then proceed to:</span>
                      <select
                        value={node.config.next_node_key || ''}
                        onChange={(e) => updateNodeConfig(node.nodeKey, { next_node_key: e.target.value })}
                        className="rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1 text-xs text-text-primary"
                      >
                        <option value="">-- Select next step --</option>
                        {allNodeKeys
                          .filter((k) => k !== node.nodeKey)
                          .map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Node Dropdown */}
        <div className="flex justify-center pt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-dashed border-border-default text-xs font-semibold px-4 py-2 hover:border-brand-600 hover:text-brand-600"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Flow Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 max-h-96 overflow-y-auto p-1.5">
              {(Object.keys(NODE_TYPES_META) as FlowNodeType[]).map((type) => {
                const m = NODE_TYPES_META[type];
                const Icon = m.icon;
                return (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => addNode(type)}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-bg-subtle"
                  >
                    <div className={cn('flex h-6 w-6 items-center justify-center rounded', m.color.split(' ')[1], m.color.split(' ')[0])}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{m.label}</p>
                      <p className="text-[10px] text-text-muted">{m.desc}</p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </main>
    </div>
  );
}
