// ============================================================================
// BrokerOS — Email Flow Builder Canvas & Node Graph Editor
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  Sparkles,
  Bot,
  Mail,
  Tag,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Globe,
  Radio,
  Play,
  Layers,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import type { EmailFlow, EmailFlowNode, CampaignItem } from '@/features/marketing/types';

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
        setName(data.name);
        setDescription(data.description || '');
        setStatus((data.status as any) || 'draft');
        setTriggerType(data.triggerType === 'any_reply' ? 'any_reply' : 'keyword_match');
        setKeywords(data.triggerConfig?.keywords || []);
        setIsGlobal(data.isGlobal ?? true);
        setSelectedCampaignIds(data.campaignIds || []);
        setNodes(data.nodes || []);

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

  const handleAddNode = (nodeType: EmailFlowNode['nodeType']) => {
    const key = `${nodeType}_${Date.now().toString(36).slice(-4)}`;
    let defaultConfig: Record<string, any> = {};

    switch (nodeType) {
      case 'send_email':
        defaultConfig = {
          subject: 'Re: Your inquiry regarding {{project_name}}',
          bodyHtml: '<p>Hello {{lead_name}},</p><p>Thank you for getting in touch. Here are the requested details...</p>',
        };
        break;
      case 'ai_reply':
        defaultConfig = {
          provider: 'groq',
          model: 'openai/gpt-oss-120b',
          instructions: 'Respond courteously, answering real estate pricing or scheduling questions, and recommend booking an on-site visit.',
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
      case 'pre_sales_handoff':
        defaultConfig = {
          priority: 'URGENT',
          note: 'Lead engaged via email reply flow',
        };
        break;
    }

    const newNode: EmailFlowNode = {
      nodeKey: key,
      nodeType,
      config: defaultConfig,
      positionX: 100,
      positionY: (nodes.length + 1) * 120,
    };

    setNodes([...nodes, newNode]);
    toast.success(`Added ${nodeType.replace('_', ' ')} node`);
  };

  const handleUpdateNodeConfig = (index: number, configPatch: Record<string, any>) => {
    const updated = [...nodes];
    updated[index] = {
      ...updated[index],
      config: { ...updated[index].config, ...configPatch },
    };
    setNodes(updated);
  };

  const handleRemoveNode = (index: number) => {
    setNodes(nodes.filter((_, i) => i !== index));
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
            matchType: 'contains',
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
      toast.success('Test simulation complete');
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

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface border border-border-default rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/marketing/email/flows">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Flow Name"
                className="text-sm font-bold h-8 px-2 border-transparent hover:border-border-default focus:border-brand-500 max-w-xs"
              />
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-zinc-500/10 text-zinc-500'
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-xs text-text-tertiary px-2">
              {nodes.length} automation action{nodes.length !== 1 ? 's' : ''} in sequence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            onClick={() => setStatus(status === 'active' ? 'draft' : 'active')}
            variant="outline"
            size="sm"
            className="text-xs font-semibold"
          >
            {status === 'active' ? 'Switch to Draft' : 'Publish as Active'}
          </Button>

          <Button
            onClick={() => setTestModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5 text-emerald-500" />
            <span>Test Flow</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-2 text-xs font-semibold shadow-xs"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Flow</span>
          </Button>
        </div>
      </div>

      {/* Scope & Trigger Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl p-6 shadow-2xs space-y-5">
        <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-4 h-4 text-brand-600" />
          <span>Trigger & Broadcast Scope</span>
        </h4>

        {/* Global vs Campaign Scoping */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setIsGlobal(true)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              isGlobal
                ? 'border-brand-600 bg-brand-500/5 ring-1 ring-brand-600/30'
                : 'border-border-default bg-bg-surface hover:border-border-hover'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Global (All Broadcasts)</span>
              </span>
              <input type="radio" checked={isGlobal} onChange={() => {}} className="text-brand-600" />
            </div>
            <p className="text-[11px] text-text-secondary">
              Evaluates incoming replies across every past and future email broadcast in BrokerOS.
            </p>
          </div>

          <div
            onClick={() => setIsGlobal(false)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              !isGlobal
                ? 'border-purple-600 bg-purple-500/5 ring-1 ring-purple-600/30'
                : 'border-border-default bg-bg-surface hover:border-border-hover'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-500" />
                <span>Specific Campaigns Only</span>
              </span>
              <input type="radio" checked={!isGlobal} onChange={() => {}} className="text-purple-600" />
            </div>
            <p className="text-[11px] text-text-secondary">
              Restrict this flow to designated marketing campaigns (e.g. Campaign 1, Campaign 3).
            </p>
          </div>
        </div>

        {/* Campaign Checkboxes if not global */}
        {!isGlobal && (
          <div className="p-4 rounded-xl bg-bg-subtle border border-border-default space-y-3">
            <label className="block text-xs font-semibold text-text-secondary">
              Select Target Campaigns ({selectedCampaignIds.length} selected)
            </label>
            {campaigns.length === 0 ? (
              <p className="text-xs text-text-tertiary">No broadcasts found in database.</p>
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

        {/* Trigger Condition Picker */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-text-secondary">
            Trigger Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setTriggerType('keyword_match')}
              className={`p-3 rounded-xl border cursor-pointer text-xs ${
                triggerType === 'keyword_match'
                  ? 'border-brand-600 bg-brand-500/5 font-semibold text-brand-700 dark:text-brand-400'
                  : 'border-border-default text-text-secondary'
              }`}
            >
              Keyword Match (Contains specific words)
            </div>
            <div
              onClick={() => setTriggerType('any_reply')}
              className={`p-3 rounded-xl border cursor-pointer text-xs ${
                triggerType === 'any_reply'
                  ? 'border-brand-600 bg-brand-500/5 font-semibold text-brand-700 dark:text-brand-400'
                  : 'border-border-default text-text-secondary'
              }`}
            >
              Any Inbound Reply (Catch-all)
            </div>
          </div>

          {triggerType === 'keyword_match' && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-text-secondary">
                Trigger Keywords (Press Enter to add)
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-bg-subtle border border-border-default min-h-[44px]">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 text-xs font-mono font-semibold"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-purple-800"
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
                  className="bg-transparent border-none outline-none text-xs flex-1 min-w-[120px] text-text-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Nodes Canvas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Execution Action Steps ({nodes.length})</span>
          </h4>
        </div>

        {nodes.length === 0 ? (
          <div className="text-center py-10 px-4 bg-bg-surface border border-dashed border-border-default rounded-2xl">
            <p className="text-xs text-text-secondary">
              No actions in this flow yet. Add actions below to execute when a lead matches the trigger.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {nodes.map((node, index) => {
              const isFirst = index === 0;
              const isLast = index === nodes.length - 1;

              return (
                <div
                  key={node.nodeKey}
                  className="bg-bg-surface border border-border-default rounded-2xl p-5 shadow-2xs space-y-4 relative"
                >
                  {/* Node Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center text-xs font-bold font-mono">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                        {node.nodeType === 'send_email' && (
                          <>
                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                            <span>Send Email Reply</span>
                          </>
                        )}
                        {node.nodeType === 'ai_reply' && (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>AI Autoreply (Groq openai/gpt-oss-120b)</span>
                          </>
                        )}
                        {node.nodeType === 'update_lead' && (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                            <span>Update Lead Profile</span>
                          </>
                        )}
                        {node.nodeType === 'add_tag' && (
                          <>
                            <Tag className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Assign Tag</span>
                          </>
                        )}
                        {node.nodeType === 'pre_sales_handoff' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Pre-Sales Manager Intake Queue</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        onClick={() => handleMoveNode(index, 'up')}
                        disabled={isFirst}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <MoveUp className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleMoveNode(index, 'down')}
                        disabled={isLast}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <MoveDown className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleRemoveNode(index)}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Node Specific Config Editors */}
                  {node.nodeType === 'send_email' && (
                    <div className="space-y-3 pt-2 border-t border-border-subtle">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Reply Email Subject Line
                        </label>
                        <Input
                          value={node.config.subject || ''}
                          onChange={(e) => handleUpdateNodeConfig(index, { subject: e.target.value })}
                          placeholder="Re: Your inquiry regarding {{project_name}}"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Email HTML / Markdown Body
                        </label>
                        <textarea
                          rows={4}
                          value={node.config.bodyHtml || ''}
                          onChange={(e) => handleUpdateNodeConfig(index, { bodyHtml: e.target.value })}
                          placeholder="Hello {{lead_name}}, ..."
                          className="w-full px-3 py-2 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {node.nodeType === 'ai_reply' && (
                    <div className="space-y-3 pt-2 border-t border-border-subtle">
                      <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-xs text-purple-700 dark:text-purple-400">
                        Evaluates lead question via Groq LPU engine (<code className="font-mono">openai/gpt-oss-120b</code>) with automatic project brochure and price context injection.
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Specific Persona Instructions
                        </label>
                        <textarea
                          rows={3}
                          value={node.config.instructions || ''}
                          onChange={(e) => handleUpdateNodeConfig(index, { instructions: e.target.value })}
                          placeholder="Guide the lead on project inventory, pricing ranges, and strongly encourage a site visit."
                          className="w-full px-3 py-2 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {node.nodeType === 'update_lead' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-subtle">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Lead Status
                        </label>
                        <select
                          value={node.config.status || 'INTERESTED'}
                          onChange={(e) => handleUpdateNodeConfig(index, { status: e.target.value })}
                          className="w-full h-9 px-2.5 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary"
                        >
                          <option value="INTERESTED">INTERESTED</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Lead Temperature
                        </label>
                        <select
                          value={node.config.temperature || 'HOT'}
                          onChange={(e) => handleUpdateNodeConfig(index, { temperature: e.target.value })}
                          className="w-full h-9 px-2.5 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary"
                        >
                          <option value="HOT">HOT</option>
                          <option value="WARM">WARM</option>
                          <option value="COLD">COLD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Score Increment
                        </label>
                        <Input
                          type="number"
                          value={node.config.scoreIncrement ?? 20}
                          onChange={(e) =>
                            handleUpdateNodeConfig(index, { scoreIncrement: parseInt(e.target.value) || 0 })
                          }
                          className="text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {node.nodeType === 'add_tag' && (
                    <div className="space-y-3 pt-2 border-t border-border-subtle">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1">
                          Tag Identifier
                        </label>
                        <Input
                          value={node.config.tagName || ''}
                          onChange={(e) => handleUpdateNodeConfig(index, { tagName: e.target.value })}
                          placeholder="SITE_VISIT_REQ"
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {node.nodeType === 'pre_sales_handoff' && (
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-700 dark:text-red-400">
                      <strong>Pre-Sales Routing:</strong> Automatically sets lead <code className="font-mono">assignedUserId: null</code> and <code className="font-mono">status: INTERESTED</code> so it lands immediately at the top of the Pre-Sales Manager's new lead triage queue.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Step Buttons */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-bg-surface border border-border-default rounded-2xl shadow-2xs">
          <span className="text-xs font-bold text-text-tertiary uppercase tracking-wide mr-2">
            Add Action:
          </span>
          <Button
            onClick={() => handleAddNode('send_email')}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Send Email</span>
          </Button>
          <Button
            onClick={() => handleAddNode('ai_reply')}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Concierge</span>
          </Button>
          <Button
            onClick={() => handleAddNode('update_lead')}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Update Lead</span>
          </Button>
          <Button
            onClick={() => handleAddNode('add_tag')}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <span>Add Tag</span>
          </Button>
          <Button
            onClick={() => handleAddNode('pre_sales_handoff')}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
            <span>Pre-Sales Handoff</span>
          </Button>
        </div>
      </div>

      {/* Simulator Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-bg-surface border border-border-default rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500" />
                <span>Simulate Inbound Reply Test</span>
              </h3>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-secondary">
                Simulated Prospect Reply
              </label>
              <textarea
                rows={3}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-bg-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <Button
                onClick={handleRunTest}
                disabled={testing || !testInput.trim()}
                className="w-full gap-2 text-xs font-semibold"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Run Inbound Test</span>
              </Button>

              {testResult && (
                <div className="p-3.5 rounded-xl bg-bg-subtle border border-border-default space-y-2 mt-3">
                  <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-brand-600" />
                    <span>Execution Result</span>
                  </div>
                  <pre className="p-2.5 bg-zinc-950 text-zinc-200 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
