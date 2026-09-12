// ============================================================================
// BrokerOS — SMS Flow Node Configuration Editor
// ============================================================================

'use client';

import React from 'react';
import {
  MessageSquare,
  Sparkles,
  GitFork,
  Tag,
  Flag,
  PlayCircle,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { calculateSmsSegments } from '@brokeros/constants';
import type { SmsFlowNode, SmsFlowNodeType } from './types';
import { BranchStepsList } from './BranchStepsList';

interface FlowNodeConfigEditorProps {
  node: SmsFlowNode;
  allNodes?: SmsFlowNode[];
  allNodeKeys: string[];
  existingTags?: { id: string; name: string; color: string }[];
  updateNodeConfig: (nodeKey: string, cfgPatch: Record<string, any>) => void;
}

export const FlowNodeConfigEditor: React.FC<FlowNodeConfigEditorProps> = ({
  node,
  existingTags = [],
  updateNodeConfig,
}) => {
  const cfg = node.config || {};

  const handleMergeTagClick = (tag: string) => {
    const currentText = cfg.text || '';
    updateNodeConfig(node.nodeKey, { text: `${currentText} ${tag} ` });
  };

  // Dual Branching (yes / no) Helpers for Condition Nodes
  const yesSteps: SmsFlowNode[] = node.branches?.yes || [];
  const noSteps: SmsFlowNode[] = node.branches?.no || [];

  const updateBranches = (newYes: SmsFlowNode[], newNo: SmsFlowNode[]) => {
    updateNodeConfig(node.nodeKey, {
      branches: {
        yes: newYes,
        no: newNo,
      },
    });
  };

  const handleAddBranchStep = (branch: 'yes' | 'no', type: SmsFlowNodeType) => {
    const newStep: SmsFlowNode = {
      nodeKey: `sub_${branch}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      nodeType: type,
      config: type === 'send_sms' ? { text: '' } : type === 'add_tag' ? { tagName: '' } : {},
    };

    if (branch === 'yes') {
      updateBranches([...yesSteps, newStep], noSteps);
    } else {
      updateBranches(yesSteps, [...noSteps, newStep]);
    }
  };

  const handleUpdateBranchStep = (branch: 'yes' | 'no', index: number, patch: Record<string, any>) => {
    if (branch === 'yes') {
      const updated = [...yesSteps];
      updated[index] = { ...updated[index], config: { ...updated[index].config, ...patch } };
      updateBranches(updated, noSteps);
    } else {
      const updated = [...noSteps];
      updated[index] = { ...updated[index], config: { ...updated[index].config, ...patch } };
      updateBranches(yesSteps, updated);
    }
  };

  const handleRemoveBranchStep = (branch: 'yes' | 'no', index: number) => {
    if (branch === 'yes') {
      updateBranches(yesSteps.filter((_, i) => i !== index), noSteps);
    } else {
      updateBranches(yesSteps, noSteps.filter((_, i) => i !== index));
    }
  };

  const handleMoveBranchStep = (branch: 'yes' | 'no', index: number, dir: -1 | 1) => {
    const target = branch === 'yes' ? [...yesSteps] : [...noSteps];
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= target.length) return;
    const temp = target[index];
    target[index] = target[newIdx];
    target[newIdx] = temp;

    if (branch === 'yes') updateBranches(target, noSteps);
    else updateBranches(yesSteps, target);
  };

  return (
    <div className="space-y-3 pt-2">
      {/* ── 1. START ENTRY ── */}
      {node.nodeType === 'start' && (
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5 text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <PlayCircle className="w-4 h-4 text-emerald-600" />
            <span>Inbound SMS Trigger Received</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Fires whenever an inbound SMS reply is received on any connected carrier number (Twilio, AWS SNS, Sinch, Gupshup) and matched with a campaign lead or keyword.
          </p>
        </div>
      )}

      {/* ── 2. SEND SMS REPLY ── */}
      {node.nodeType === 'send_sms' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              SMS Message Copy:
            </label>
            {(() => {
              const { segments, charCount, isUnicode } = calculateSmsSegments(cfg.text || '');
              return (
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {charCount} chars • {segments} segment{segments > 1 ? 's' : ''} ({isUnicode ? 'UCS-2' : 'GSM-7'})
                </span>
              );
            })()}
          </div>

          <Textarea
            rows={3}
            value={cfg.text || ''}
            onChange={(e) => updateNodeConfig(node.nodeKey, { text: e.target.value })}
            placeholder="Hi {{firstName}}, thank you for inquiring about {{projectName}}! Would you like me to book a VIP site visit for this weekend?"
            className="text-xs"
          />

          {/* Merge Tags Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">Insert tag:</span>
            {['{{firstName}}', '{{projectName}}', '{{budget}}', '{{agentName}}', '{{agentPhone}}'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleMergeTagClick(tag)}
                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10px] font-bold hover:bg-amber-100 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. GROQ AI CONCIERGE ── */}
      {node.nodeType === 'ai_agent' && (
        <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-3 text-xs">
          <div className="flex items-center gap-2 text-purple-900 font-bold">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Groq LPU AI Concierge (openai/gpt-oss-120b)</span>
          </div>
          <p className="text-[11px] text-purple-700/90 font-medium">
            AI automatically analyzes the inbound SMS text, consults the project brochure details, and replies succinctly in 160 characters or less.
          </p>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-purple-900">
              Custom Prompt Instructions (Optional):
            </label>
            <Textarea
              rows={2}
              value={cfg.customPrompt || cfg.instructions || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { instructions: e.target.value, customPrompt: e.target.value })}
              placeholder="Highlight our flexible 10:90 payment plan and encourage them to reply with VISIT to schedule."
              className="text-xs bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-purple-200/50">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-purple-900 flex items-center justify-between">
                <span>Max Autonomous Turns:</span>
                <span className="font-mono bg-purple-100 px-1.5 py-0.5 rounded text-purple-800">{cfg.maxTurns ?? 3}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={cfg.maxTurns ?? 3}
                onChange={(e) => updateNodeConfig(node.nodeKey, { maxTurns: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
              <p className="text-[10px] text-purple-700">Auto-escalates after {cfg.maxTurns ?? 3} back-and-forth SMS exchanges.</p>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cfg.stopIfHumanActive !== false}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { stopIfHumanActive: e.target.checked })}
                  className="rounded accent-purple-600"
                />
                <span className="text-[11px] font-bold text-purple-900">Pause if Sales Exec Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cfg.handoffOnMax !== false}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { handoffOnMax: e.target.checked })}
                  className="rounded accent-purple-600"
                />
                <span className="text-[11px] font-bold text-purple-900">Auto-Handoff to Pre-Sales</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. IF / ELSE CONDITION DUAL-BRANCH ── */}
      {node.nodeType === 'condition' && (
        <div className="space-y-4 pt-1">
          <div className="p-3 bg-fuchsia-50/50 border border-fuchsia-200/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fuchsia-950 flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-fuchsia-600" />
                <span>Condition Evaluation Criteria</span>
              </span>
              <select
                value={cfg.criteriaType || 'keywords'}
                onChange={(e) => updateNodeConfig(node.nodeKey, { criteriaType: e.target.value })}
                className="text-[11px] font-bold rounded-lg border border-fuchsia-200 bg-white px-2 py-1 text-fuchsia-900"
              >
                <option value="keywords">Inbound Keywords</option>
                <option value="tag">CRM Lead Tag</option>
                <option value="budget">Minimum Lead Budget</option>
              </select>
            </div>

            {(!cfg.criteriaType || cfg.criteriaType === 'keywords') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-fuchsia-900">
                    Match Mode:
                  </label>
                  <select
                    value={cfg.matchType || 'contains'}
                    onChange={(e) => updateNodeConfig(node.nodeKey, { matchType: e.target.value })}
                    className="text-[11px] font-bold rounded-lg border border-fuchsia-200 bg-white px-2 py-0.5 text-fuchsia-900"
                  >
                    <option value="contains">Contains Any Keyword</option>
                    <option value="exact">Exact Word Match</option>
                    <option value="starts_with">Starts With</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-fuchsia-900 block mb-1">
                    Comma-separated Keywords:
                  </label>
                  <Input
                    type="text"
                    value={Array.isArray(cfg.keywords) ? cfg.keywords.join(', ') : cfg.keywords || ''}
                    onChange={(e) =>
                      updateNodeConfig(node.nodeKey, {
                        keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean),
                      })
                    }
                    placeholder="visit, price, cost, brochure, schedule"
                    className="text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {cfg.criteriaType === 'tag' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-fuchsia-900 block">
                  Prospect Must Have CRM Tag:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={cfg.tag || ''}
                    onChange={(e) => updateNodeConfig(node.nodeKey, { tag: e.target.value })}
                    className="flex-1 text-xs rounded-lg border border-fuchsia-200 bg-white p-1.5 font-bold text-fuchsia-900"
                  >
                    <option value="">Select a tag...</option>
                    {existingTags.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                    <option value="Hot Prospect">Hot Prospect</option>
                    <option value="Site Visit Requested">Site Visit Requested</option>
                    <option value="Price Sensitive">Price Sensitive</option>
                  </select>
                  <Input
                    type="text"
                    placeholder="Or type tag name..."
                    value={cfg.tag || ''}
                    onChange={(e) => updateNodeConfig(node.nodeKey, { tag: e.target.value })}
                    className="text-xs w-40 bg-white"
                  />
                </div>
              </div>
            )}

            {cfg.criteriaType === 'budget' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-fuchsia-900 block">
                  Minimum Lead Budget Threshold (INR ₹):
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 15000000 (1.5 Cr)"
                  value={cfg.minBudget || ''}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { minBudget: Number(e.target.value) })}
                  className="text-xs bg-white"
                />
                <p className="text-[10px] text-fuchsia-700">Branches to YES if the prospect lead budget is at or above this value.</p>
              </div>
            )}
          </div>

          {/* WhatsApp / Email Parity Dual Branch Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <BranchStepsList
              branch="yes"
              steps={yesSteps}
              existingTags={existingTags}
              onAddStep={(t) => handleAddBranchStep('yes', t)}
              onUpdateStep={(i, p) => handleUpdateBranchStep('yes', i, p)}
              onRemoveStep={(i) => handleRemoveBranchStep('yes', i)}
              onMoveStep={(i, d) => handleMoveBranchStep('yes', i, d)}
            />
            <BranchStepsList
              branch="no"
              steps={noSteps}
              existingTags={existingTags}
              onAddStep={(t) => handleAddBranchStep('no', t)}
              onUpdateStep={(i, p) => handleUpdateBranchStep('no', i, p)}
              onRemoveStep={(i) => handleRemoveBranchStep('no', i)}
              onMoveStep={(i, d) => handleMoveBranchStep('no', i, d)}
            />
          </div>
        </div>
      )}

      {/* ── 5. ASSIGN CRM TAG ── */}
      {node.nodeType === 'add_tag' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Select CRM Tag (Configured in SMS Settings):
            </label>
            <select
              value={cfg.tagName || cfg.tag || ''}
              onChange={(e) => {
                const selectedName = e.target.value;
                const matched = existingTags.find((t) => t.name === selectedName);
                updateNodeConfig(node.nodeKey, {
                  tagName: selectedName,
                  tag: selectedName,
                  color: matched?.color || '#8B5CF6',
                });
              }}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="">-- Select an existing tag --</option>
              {existingTags.map((t) => (
                <option key={t.id || t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {(cfg.tagName || cfg.tag) && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-subtle border border-border-subtle text-xs">
              <Tag className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-text-secondary">Assigned CRM Tag:</span>
              <span
                className="px-2 py-0.5 rounded-md font-mono font-bold text-white text-[11px] shadow-2xs"
                style={{ backgroundColor: cfg.color || '#8B5CF6' }}
              >
                {cfg.tagName || cfg.tag}
              </span>
            </div>
          )}

          <p className="text-[11px] text-text-tertiary">
            CRM tags are centrally created and managed in{' '}
            <a
              href="/dashboard/marketing/sms/settings"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 underline font-semibold hover:text-brand-700"
            >
              SMS Settings → Tags
            </a>{' '}
            to avoid duplicate typos.
          </p>
        </div>
      )}

      {/* ── 6. END FLOW ── */}
      {node.nodeType === 'end' && (
        <div className="p-3 bg-zinc-500/5 border border-zinc-500/20 rounded-xl text-xs text-text-secondary">
          <p className="font-semibold text-text-primary">Terminal Step</p>
          <p className="text-[11px] mt-0.5 opacity-90">
            Execution terminates at this node. No further automated actions will be executed for this reply.
          </p>
        </div>
      )}
    </div>
  );
};
