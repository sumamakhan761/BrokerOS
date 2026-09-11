// ============================================================================
// BrokerOS — Email Flow Canvas Builder View (Full WhatsApp Visual Parity)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  Loader2,
  Sparkles,
  Play,
  Layers,
  Radio,
  Globe,
  History,
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
import type { EmailFlow, CampaignItem } from '@/features/marketing/types';
import type { EmailFlowNodeType, EmailFlowNode } from './builder/types';
import { EMAIL_NODE_TYPES_META } from './builder/types';
import { FlowNodeCard } from './builder/FlowNodeCard';

interface EmailFlowBuilderViewProps {
  id: string;
}

export function EmailFlowBuilderView({ id }: EmailFlowBuilderViewProps) {
  const router = useRouter();
  const [flow, setFlow] = useState<EmailFlow | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [triggerType, setTriggerType] = useState<'keyword_match' | 'any_reply'>('keyword_match');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [nodes, setNodes] = useState<EmailFlowNode[]>([]);

  // Simulation test state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testInput, setTestInput] = useState('Can you send the pricing sheet and when can I visit the sample flat?');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Flow
        const res = await fetch(`${baseUrl}/api/marketing/email/flows/${id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Flow not found');
        const data: EmailFlow = await res.json();
        setFlow(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setStatus((data.status as any) || 'draft');
        setTriggerType(data.triggerType === 'any_reply' ? 'any_reply' : 'keyword_match');
        setKeywords(data.triggerConfig?.keywords || []);
        setIsGlobal(data.isGlobal ?? true);
        setSelectedCampaignIds(data.campaignIds || []);

        // Normalize legacy nodeType aliases to current standard types
        const rawNodes: any[] = data.nodes || [];
        const normalizedNodes: EmailFlowNode[] = rawNodes.map((n, idx) => {
          let nodeType = n.nodeType as EmailFlowNodeType;
          if (n.nodeType === 'ai_reply') nodeType = 'ai_agent';
          else if (n.nodeType === 'pre_sales_handoff') nodeType = 'human_handoff';
          else if (!EMAIL_NODE_TYPES_META[nodeType]) nodeType = 'send_email';

          return {
            id: n.id,
            nodeKey: n.nodeKey || `node_${Date.now().toString(36)}_${idx}`,
            nodeType,
            config: n.config || {},
            positionX: n.positionX ?? 100,
            positionY: n.positionY ?? (idx + 1) * 120,
          };
        });
        setNodes(normalizedNodes);

        // Load active campaigns for scoping
        const campRes = await fetch(`${baseUrl}/api/marketing/campaigns`, {
          credentials: 'include',
        });
        if (campRes.ok) {
          const campData = await campRes.json();
          setCampaigns(campData.items || []);
        }
      } catch (err: any) {
        toast.error(err.message || 'Error loading flow details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, baseUrl]);

  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = newKeyword.trim().toLowerCase();
    if (!clean || keywords.includes(clean)) return;
    setKeywords([...keywords, clean]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleAddNode = (type: EmailFlowNodeType) => {
    const key = `${type}_${Date.now().toString(36).slice(-4)}`;
    let defaultConfig: Record<string, any> = {};

    switch (type) {
      case 'start':
        defaultConfig = {};
        break;
      case 'send_email':
        defaultConfig = {
          subject: 'Re: Your inquiry regarding {{project_name}}',
          bodyHtml: '<p>Hello {{lead_name}},</p><p>Thank you for getting in touch. Here are the requested details...</p>',
        };
        break;
      case 'ai_agent':
        defaultConfig = {
          provider: 'groq',
          model: 'openai/gpt-oss-120b',
          instructions: 'Respond courteously, answering real estate pricing or scheduling questions, and recommend booking an on-site visit.',
          maxTurns: 3,
          stopIfHumanActive: true,
          handoffOnMax: true,
        };
        break;
      case 'condition':
        defaultConfig = {
          conditionType: 'keywords',
          keywords: 'visit, tour, see flat, schedule',
          if_true_node_key: '',
          if_false_node_key: '',
        };
        break;
      case 'update_lead':
        defaultConfig = {
          status: 'INTERESTED',
          temperature: 'HOT',
          scoreIncrement: 20,
        };
        break;
      case 'add_tag':
        defaultConfig = {
          tagName: 'SITE_VISIT_REQ',
          color: '#10b981',
        };
        break;
      case 'human_handoff':
        defaultConfig = {
          priority: 'URGENT',
          note: 'Lead requested direct sales advisor contact via email flow',
        };
        break;
      case 'end':
        defaultConfig = {};
        break;
    }

    const newNode: EmailFlowNode = {
      nodeKey: key,
      nodeType: type,
      config: defaultConfig,
      positionX: 100,
      positionY: (nodes.length + 1) * 120,
    };

    setNodes([...nodes, newNode]);
    toast.success(`Added ${EMAIL_NODE_TYPES_META[type]?.label || type} step`);
  };

  const handleUpdateNodeConfig = (nodeKey: string, configPatch: Record<string, any>) => {
    setNodes((prev) =>
      prev.map((n) => (n.nodeKey === nodeKey ? { ...n, config: { ...n.config, ...configPatch } } : n)),
    );
  };

  const handleRemoveNode = (nodeKey: string) => {
    setNodes((prev) => prev.filter((n) => n.nodeKey !== nodeKey));
    toast.success('Action step removed');
  };

  const handleMoveNode = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === nodes.length - 1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    const updated = [...nodes];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setNodes(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Flow name is required');
      return;
    }
    if (triggerType === 'keyword_match' && keywords.length === 0) {
      toast.error('Please add at least one trigger keyword');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${baseUrl}/api/marketing/email/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          status,
          triggerType,
          triggerConfig: {
            keywords,
            matchMode: 'contains',
          },
          isGlobal,
          campaignIds: isGlobal ? [] : selectedCampaignIds,
          nodes: nodes.map((n, idx) => ({
            nodeKey: n.nodeKey,
            nodeType: n.nodeType,
            config: n.config,
            positionX: 100,
            positionY: (idx + 1) * 120,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save flow');
      }

      toast.success('Flow saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving flow');
    } finally {
      setSaving(false);
    }
  };

  const handleRunTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await fetch(`${baseUrl}/api/marketing/email/inbound/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadEmail: 'prospect-tester@example.com',
          senderEmail: 'sales@instance.sale',
          subject: 'Inquiry regarding property and visit',
          bodyText: testInput,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.matchedFlowId) {
        toast.success(`Matched flow "${data.flowName}"!`);
      } else {
        toast.info('No flow matched this input text.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Test simulation error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
        <p className="text-xs text-text-tertiary">Loading flow canvas...</p>
      </div>
    );
  }

  const allNodeKeys = nodes.map((n) => n.nodeKey);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* ── Top Header (WhatsApp Visual Parity) ── */}
      <header className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border-default bg-bg-surface px-5 py-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/dashboard/marketing/email/flows')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Flow bot name..."
              className="text-base font-bold text-text-primary bg-transparent focus:bg-bg-subtle rounded px-1.5 py-0.5 focus:outline-none w-full max-w-md"
            />
            <p className="text-[11px] text-text-tertiary px-1.5">
              {nodes.length} automation step{nodes.length !== 1 ? 's' : ''} in sequence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Run History Button */}
          <button
            type="button"
            onClick={() => router.push(`/dashboard/marketing/email/flows/${id}/runs`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand-600 transition-colors px-2.5 py-1.5 rounded-lg border border-border-default bg-bg-surface"
          >
            <History className="h-3.5 w-3.5" />
            <span>Run History</span>
          </button>

          {/* Active / Draft Switch */}
          <div className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-1 text-xs font-semibold">
            <span>{status === 'active' ? 'Active' : 'Draft'}</span>
            <Switch
              checked={status === 'active'}
              onCheckedChange={(v) => setStatus(v ? 'active' : 'draft')}
            />
          </div>

          {/* Test Flow Button */}
          <Button
            onClick={() => setTestModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold h-8"
          >
            <Play className="w-3.5 h-3.5 text-emerald-500" />
            <span>Test Flow</span>
          </Button>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-brand-600 text-white hover:bg-brand-700 text-xs h-8 font-semibold px-4"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            <span>Save Flow</span>
          </Button>
        </div>
      </header>

      {/* ── Trigger & Scope Settings Card ── */}
      <div className="rounded-2xl border border-brand-500/30 bg-bg-surface p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              Trigger & Scope Settings
            </span>
            <h3 className="text-xs font-bold text-text-primary">
              Inbound Prospect Email Reply Listener
            </h3>
          </div>
        </div>

        {/* Global vs Campaign Scoping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div
            onClick={() => setIsGlobal(true)}
            className={cn(
              'p-3.5 rounded-xl border cursor-pointer transition-all',
              isGlobal
                ? 'border-brand-600 bg-brand-500/5 ring-1 ring-brand-600/30'
                : 'border-border-default bg-bg-surface hover:border-border-hover',
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Global Scope (All Broadcasts)</span>
              </span>
              <input type="radio" checked={isGlobal} onChange={() => {}} className="text-brand-600" />
            </div>
            <p className="text-[11px] text-text-secondary">
              Listens for replies across all present and future email campaigns.
            </p>
          </div>

          <div
            onClick={() => setIsGlobal(false)}
            className={cn(
              'p-3.5 rounded-xl border cursor-pointer transition-all',
              !isGlobal
                ? 'border-purple-600 bg-purple-500/5 ring-1 ring-purple-600/30'
                : 'border-border-default bg-bg-surface hover:border-border-hover',
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-500" />
                <span>Specific Campaigns Only</span>
              </span>
              <input type="radio" checked={!isGlobal} onChange={() => {}} className="text-purple-600" />
            </div>
            <p className="text-[11px] text-text-secondary">
              Restrict this automation only to designated marketing campaigns.
            </p>
          </div>
        </div>

        {/* Campaign Selection Checkboxes (if not global) */}
        {!isGlobal && (
          <div className="p-3.5 rounded-xl bg-bg-subtle border border-border-default space-y-2.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Designated Campaigns ({selectedCampaignIds.length} selected):
            </label>
            {campaigns.length === 0 ? (
              <p className="text-xs text-text-tertiary">No campaigns found in database.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {campaigns.map((c) => {
                  const checked = selectedCampaignIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-bg-surface border border-border-subtle hover:border-border-default cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCampaignIds([...selectedCampaignIds, c.id]);
                          } else {
                            setSelectedCampaignIds(selectedCampaignIds.filter((id) => id !== c.id));
                          }
                        }}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span className="font-medium text-text-primary truncate">{c.title}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Trigger Type Selection */}
        <div className="space-y-2.5 pt-1 border-t border-border-subtle">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setTriggerType('keyword_match')}
              className={cn(
                'p-2.5 rounded-xl border text-left text-xs transition-all',
                triggerType === 'keyword_match'
                  ? 'border-brand-600 bg-brand-500/5 font-semibold text-brand-700 dark:text-brand-400'
                  : 'border-border-default text-text-secondary hover:border-border-hover',
              )}
            >
              Keyword Match (Contains specific words)
            </button>
            <button
              type="button"
              onClick={() => setTriggerType('any_reply')}
              className={cn(
                'p-2.5 rounded-xl border text-left text-xs transition-all',
                triggerType === 'any_reply'
                  ? 'border-brand-600 bg-brand-500/5 font-semibold text-brand-700 dark:text-brand-400'
                  : 'border-border-default text-text-secondary hover:border-border-hover',
              )}
            >
              Any Inbound Reply (Catch-all)
            </button>
          </div>

          {triggerType === 'keyword_match' && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-text-secondary">
                Trigger Keywords (Type word & press Enter to add)
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-bg-subtle border border-border-default min-h-[42px]">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 text-xs font-mono font-semibold"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-purple-800 text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="e.g. visit, price, brochure, tour..."
                  className="bg-transparent border-none outline-none text-xs flex-1 min-w-[130px] text-text-primary px-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Nodes Canvas ── */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Execution Action Steps ({nodes.length})</span>
          </h4>
        </div>

        {nodes.length === 0 ? (
          <div className="text-center py-12 px-4 bg-bg-surface border border-dashed border-border-default rounded-2xl">
            <p className="text-xs text-text-secondary font-medium">
              No actions in this flow yet. Use the button below to add your first step!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {nodes.map((node, index) => (
              <FlowNodeCard
                key={node.nodeKey}
                node={node}
                index={index}
                totalNodes={nodes.length}
                allNodeKeys={allNodeKeys}
                updateNodeConfig={handleUpdateNodeConfig}
                removeNode={handleRemoveNode}
                moveNode={handleMoveNode}
              />
            ))}
          </div>
        )}

        {/* ── Add Node Dropdown (WhatsApp Parity) ── */}
        <div className="flex justify-center pt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-dashed border-border-default text-xs font-semibold px-4 py-2 hover:border-brand-600 hover:text-brand-600 gap-1.5 shadow-2xs"
              >
                <Plus className="h-4 w-4 text-brand-600" />
                <span>Add Flow Node</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-72 max-h-96 overflow-y-auto p-1.5">
              {(Object.keys(EMAIL_NODE_TYPES_META) as EmailFlowNodeType[])
                .filter((type) => type !== 'start')
                .map((type) => {
                  const m = EMAIL_NODE_TYPES_META[type];
                  const Icon = m.icon;
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleAddNode(type)}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-bg-subtle"
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg shrink-0',
                          m.color.split(' ')[1],
                          m.color.split(' ')[0],
                        )}
                      >
                        <Icon className="h-4 w-4" />
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
      </div>

      {/* ── Test Simulator Modal ── */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-bg-surface border border-border-default rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500" />
                <span>Simulate Inbound Prospect Reply</span>
              </h3>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="text-text-tertiary hover:text-text-primary text-base font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Inbound Reply Message Body:
                </label>
                <textarea
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                />
              </div>

              <Button
                onClick={handleRunTest}
                disabled={testing || !testInput.trim()}
                className="w-full gap-2 text-xs font-semibold"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Execute Simulation Test</span>
              </Button>

              {testResult && (
                <div className="p-3.5 rounded-xl bg-bg-subtle border border-border-default space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">Simulation Result:</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        testResult.matchedFlowId
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {testResult.matchedFlowId ? 'Flow Matched' : 'No Flow Matched'}
                    </span>
                  </div>

                  {testResult.flowName && (
                    <p className="text-[11px] text-text-secondary">
                      <strong>Matched Flow:</strong> {testResult.flowName}
                    </p>
                  )}

                  {testResult.actionsExecuted && testResult.actionsExecuted.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-text-secondary mb-1">Executed Actions:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-text-primary">
                        {testResult.actionsExecuted.map((act: string, i: number) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {testResult.outboundReply && (
                    <div className="mt-2 pt-2 border-t border-border-subtle">
                      <p className="text-[11px] font-semibold text-brand-600 mb-1">Generated Response:</p>
                      <div className="p-2 rounded bg-bg-surface border border-border-subtle text-[11px] whitespace-pre-wrap font-sans">
                        {testResult.outboundReply}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
