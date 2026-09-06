// ============================================================================
// BrokerOS — WhatsApp Interactive Flow Builder View
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Save,
  Loader2,
  History,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { FlowNodeType, FlowNode, FlowData } from './builder/types';
import { NODE_TYPES_META } from './builder/types';
import { FlowNodeCard } from './builder/FlowNodeCard';

export type { FlowNodeType, FlowNode };

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
          {flow.nodes.map((node, idx) => (
            <FlowNodeCard
              key={node.nodeKey}
              node={node}
              index={idx}
              allNodeKeys={allNodeKeys}
              updateNodeConfig={updateNodeConfig}
              removeNode={removeNode}
            />
          ))}
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
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded',
                        m.color.split(' ')[1],
                        m.color.split(' ')[0],
                      )}
                    >
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
