// ============================================================================
// BrokerOS — SMS Flow Canvas Builder View (Full WhatsApp & Email Visual Parity)
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
  CheckCircle2,
  X,
  Smartphone,
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
import type { SmsFlowNodeType, SmsFlowNode } from './builder/types';
import { SMS_NODE_TYPES_META } from './builder/types';
import { FlowNodeCard } from './builder/FlowNodeCard';

interface SmsFlowBuilderViewProps {
  id: string;
}

export function SmsFlowBuilderView({ id }: SmsFlowBuilderViewProps) {
  const router = useRouter();
  const [flow, setFlow] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [triggerType, setTriggerType] = useState<'keyword_match' | 'any_reply' | 'campaign_reply'>('keyword_match');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isGlobal, setIsGlobal] = useState(true);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [nodes, setNodes] = useState<SmsFlowNode[]>([]);
  const [existingTags, setExistingTags] = useState<{ id: string; name: string; color: string }[]>([]);

  // Simulation test state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testInput, setTestInput] = useState('Can you send the pricing sheet and when can I visit the sample flat?');
  const [testLeadPhone, setTestLeadPhone] = useState('+15552345678');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load Flow
        const res = await fetch(`${baseUrl}/api/marketing/sms/flows/${id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('SMS Flow not found');
        const data = await res.json();
        setFlow(data);
        setName(data.name || '');
        setDescription(data.description || '');
        setStatus((data.status as any) || 'draft');
        setTriggerType(data.triggerType === 'any_reply' ? 'any_reply' : data.triggerType === 'campaign_reply' ? 'campaign_reply' : 'keyword_match');
        setKeywords(data.triggerConfig?.keywords || ['visit', 'price']);
        setIsGlobal(data.isGlobal ?? true);
        setSelectedCampaignIds(data.campaignIds || []);

        const rawNodes: any[] = data.nodes || [];
        const normalizedNodes: SmsFlowNode[] = rawNodes.map((n, idx) => {
          const nodeType = (n.nodeType as SmsFlowNodeType) || 'send_sms';
          return {
            id: n.id,
            nodeKey: n.nodeKey || `node_${Date.now().toString(36)}_${idx}`,
            nodeType,
            config: n.config || {},
            branches: n.branches || n.config?.branches || (nodeType === 'condition' ? { yes: [], no: [] } : undefined),
            positionX: n.positionX ?? 100,
            positionY: n.positionY ?? (idx + 1) * 120,
          };
        });
        setNodes(normalizedNodes);

        // Load active campaigns for scoping
        const campRes = await fetch(`${baseUrl}/api/marketing/sms/campaigns`, {
          credentials: 'include',
        });
        if (campRes.ok) {
          const campData = await campRes.json();
          setCampaigns(campData.items || []);
        }

        // Load CRM Tags from settings
        const tagsRes = await fetch(`${baseUrl}/api/marketing/sms/tags`, {
          credentials: 'include',
        });
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          if (Array.isArray(tagsData)) setExistingTags(tagsData);
        }
      } catch (err: any) {
        toast.error(err.message || 'Error loading SMS flow details');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, baseUrl]);

  const handleAddKeyword = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    const clean = newKeyword.trim().toLowerCase();
    if (clean && !keywords.includes(clean)) {
      setKeywords([...keywords, clean]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleAddNode = (type: SmsFlowNodeType) => {
    const newNodeKey = `step_${Date.now().toString(36)}_${nodes.length + 1}`;
    const newNode: SmsFlowNode = {
      nodeKey: newNodeKey,
      nodeType: type,
      config:
        type === 'send_sms'
          ? { text: 'Thank you for your reply! Would you like a brochure sent over?' }
          : type === 'condition'
          ? { keywords: ['visit', 'price'], matchType: 'contains' }
          : {},
      branches: type === 'condition' ? { yes: [], no: [] } : undefined,
    };
    setNodes([...nodes, newNode]);
  };

  const handleUpdateNodeConfig = (nodeKey: string, cfgPatch: Record<string, any>) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.nodeKey === nodeKey) {
          return {
            ...n,
            config: { ...n.config, ...cfgPatch },
            ...(cfgPatch.branches ? { branches: cfgPatch.branches } : {}),
          };
        }
        return n;
      }),
    );
  };

  const handleRemoveNode = (nodeKey: string) => {
    setNodes((prev) => prev.filter((n) => n.nodeKey !== nodeKey));
  };

  const handleMoveNode = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nodes.length) return;
    const newNodes = [...nodes];
    const temp = newNodes[index];
    newNodes[index] = newNodes[targetIndex];
    newNodes[targetIndex] = temp;
    setNodes(newNodes);
  };

  const handleSaveFlow = async () => {
    if (!name.trim()) {
      toast.error('Please provide a name for this automation flow');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        description,
        status,
        triggerType,
        triggerConfig: {
          keywords,
          matchType: 'contains',
        },
        isGlobal,
        campaignIds: selectedCampaignIds,
        nodes: nodes.map((n, idx) => ({
          nodeKey: n.nodeKey,
          nodeType: n.nodeType,
          config: {
            ...n.config,
            ...(n.branches ? { branches: n.branches } : {}),
          },
          positionX: n.positionX ?? 100,
          positionY: n.positionY ?? (idx + 1) * 120,
        })),
      };

      const res = await fetch(`${baseUrl}/api/marketing/sms/flows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save SMS flow');
      }

      toast.success('SMS Flow successfully saved and updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save SMS flow');
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!testInput.trim()) return;
    try {
      setTesting(true);
      setTestResult(null);

      const res = await fetch(`${baseUrl}/api/marketing/sms/flows/${id}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          leadPhone: testLeadPhone,
          senderPhone: '+14155550199',
          bodyText: testInput,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Simulation test failed');
      }

      const result = await res.json();
      setTestResult(result);
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute test simulation');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* ── Top Navigation Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/marketing/sms/flows')}
            className="h-8 w-8 p-0 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Flow Name (e.g. VIP Site Visit Autoresponder)"
                className="font-extrabold text-sm h-8 px-2.5 w-72 bg-slate-50 border-slate-200"
              />
              <span
                className={cn(
                  'px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider',
                  status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700',
                )}
              >
                {status}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Flow ID: <span className="font-mono text-slate-400">{id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-xs font-bold text-slate-700">Active Status</span>
            <Switch
              checked={status === 'active'}
              onCheckedChange={(checked) => setStatus(checked ? 'active' : 'draft')}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTestModalOpen(true)}
            className="gap-1.5 text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Simulator</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleSaveFlow}
            disabled={saving}
            className="gap-1.5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Flow</span>
          </Button>
        </div>
      </div>

      {/* ── Trigger Settings Card ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              1. Inbound SMS Trigger Rule
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Define what activates this automation when a mobile lead replies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTriggerType('keyword_match')}
            className={cn(
              'p-3.5 rounded-2xl border text-left transition-all',
              triggerType === 'keyword_match'
                ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300',
            )}
          >
            <div className="font-extrabold text-xs text-slate-900">Keyword Match</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Fires when the inbound SMS message contains specific keywords like &quot;VISIT&quot;, &quot;PRICE&quot;, etc.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTriggerType('any_reply')}
            className={cn(
              'p-3.5 rounded-2xl border text-left transition-all',
              triggerType === 'any_reply'
                ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300',
            )}
          >
            <div className="font-extrabold text-xs text-slate-900">Any Inbound Reply</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Fires unconditionally for any reply from an audience contact.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTriggerType('campaign_reply')}
            className={cn(
              'p-3.5 rounded-2xl border text-left transition-all',
              triggerType === 'campaign_reply'
                ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300',
            )}
          >
            <div className="font-extrabold text-xs text-slate-900">Specific Broadcast Only</div>
            <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
              Scoped strictly to recipients belonging to selected SMS broadcasts.
            </div>
          </button>
        </div>

        {/* Keywords Input (when keyword_match) */}
        {triggerType === 'keyword_match' && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-slate-700">Trigger Keywords:</label>
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Type keyword and press Enter..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleAddKeyword}
                className="flex-1 min-w-[180px] bg-transparent text-xs font-bold focus:outline-none p-1 placeholder:text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Flow Steps Canvas ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              2. Automation Execution Sequence
            </h2>
            <span className="text-xs font-bold text-slate-400">
              ({nodes.length} Step{nodes.length === 1 ? '' : 's'})
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="gap-1.5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Action Step</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1">
              {(
                ['send_sms', 'ai_agent', 'condition', 'add_tag', 'update_lead', 'end'] as SmsFlowNodeType[]
              ).map((type) => {
                const meta = SMS_NODE_TYPES_META[type];
                const Icon = meta.icon;
                return (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleAddNode(type)}
                    className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer"
                  >
                    <div className={cn('p-1 rounded-md', meta.color.split(' ')[1], meta.color.split(' ')[0])}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">{meta.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{meta.desc}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Steps List Cards */}
        <div className="space-y-3">
          {nodes.map((node, idx) => (
            <FlowNodeCard
              key={node.nodeKey}
              node={node}
              index={idx}
              totalNodes={nodes.length}
              allNodes={nodes}
              allNodeKeys={nodes.map((n) => n.nodeKey)}
              existingTags={existingTags}
              updateNodeConfig={handleUpdateNodeConfig}
              removeNode={handleRemoveNode}
              moveNode={handleMoveNode}
            />
          ))}
        </div>
      </div>

      {/* ── Test Simulator Modal ── */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-enter">
            <div className="bg-gradient-to-r from-amber-950 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-extrabold">Inbound SMS Simulation Runner</h3>
                  <p className="text-[11px] text-amber-200/80">
                    Test flow triggers and If/Else branch routing in real time.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="p-1 rounded-full text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Simulated Lead Phone:</label>
                <Input
                  value={testLeadPhone}
                  onChange={(e) => setTestLeadPhone(e.target.value)}
                  placeholder="+15552345678"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inbound SMS Reply Text:</label>
                <textarea
                  rows={3}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter prospect message..."
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-2.5"
                />
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={handleRunSimulation}
                disabled={testing || !testInput.trim()}
                className="w-full gap-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{testing ? 'Evaluating Flow...' : 'Execute Simulation Test'}</span>
              </Button>

              {/* Simulation Result Output */}
              {testResult && (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>✓ Simulation Complete</span>
                    <span>Status: Evaluated</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 space-y-1 text-slate-300">
                    <div>Keywords Tested: {keywords.join(', ')}</div>
                    <div>
                      Evaluation:{' '}
                      <span className="text-amber-400 font-bold">
                        {JSON.stringify(testResult.flowResult || testResult, null, 2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
