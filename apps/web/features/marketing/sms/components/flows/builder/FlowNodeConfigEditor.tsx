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
  UserCheck,
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
        <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-purple-900 font-bold">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Groq LPU AI Autoreply (openai/gpt-oss-120b)</span>
          </div>
          <p className="text-[11px] text-purple-700/90 font-medium">
            AI automatically analyzes the inbound SMS text, consults the project brochure details, and replies succinctly in 160 characters or less.
          </p>
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-bold text-purple-900">
              Custom Prompt Instructions (Optional):
            </label>
            <Textarea
              rows={2}
              value={cfg.customPrompt || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { customPrompt: e.target.value })}
              placeholder="Highlight our flexible 10:90 payment plan and encourage them to reply with VISIT to schedule."
              className="text-xs bg-white"
            />
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
                <span>Condition Trigger Match</span>
              </span>
              <select
                value={cfg.matchType || 'contains'}
                onChange={(e) => updateNodeConfig(node.nodeKey, { matchType: e.target.value })}
                className="text-[11px] font-bold rounded-lg border border-fuchsia-200 bg-white px-2 py-1 text-fuchsia-900"
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
                placeholder="visit, price, cost, brochure, site visit, schedule"
                className="text-xs bg-white"
              />
            </div>
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
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-primary)]">Select or Create CRM Tag:</label>
          <div className="flex items-center gap-2">
            <select
              value={cfg.tagName || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { tagName: e.target.value })}
              className="flex-1 text-xs rounded-xl border border-border-default bg-bg-surface p-2 font-bold text-[var(--text-primary)]"
            >
              <option value="">Select an existing tag...</option>
              {existingTags.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
              <option value="Site Visit Requested">Site Visit Requested</option>
              <option value="Price Sensitive">Price Sensitive</option>
              <option value="Hot Prospect">Hot Prospect</option>
              <option value="Broker Query">Broker Query</option>
            </select>
            <Input
              type="text"
              placeholder="Or custom tag..."
              value={cfg.tagName || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { tagName: e.target.value })}
              className="text-xs w-44"
            />
          </div>
        </div>
      )}

      {/* ── 6. UPDATE LEAD PIPELINE ── */}
      {node.nodeType === 'update_lead' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl">
          <div>
            <label className="text-[11px] font-bold text-blue-900 block mb-1">
              Set Lead Temperature:
            </label>
            <select
              value={cfg.temperature || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { temperature: e.target.value })}
              className="w-full text-xs font-bold rounded-lg border border-blue-200 bg-white p-2"
            >
              <option value="">No change</option>
              <option value="HOT">🔥 HOT (High Intent)</option>
              <option value="WARM">⚡ WARM (Interested)</option>
              <option value="COLD">❄️ COLD (Passive)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-blue-900 block mb-1">
              Set Lead Status:
            </label>
            <select
              value={cfg.status || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { status: e.target.value })}
              className="w-full text-xs font-bold rounded-lg border border-blue-200 bg-white p-2"
            >
              <option value="">No change</option>
              <option value="ATTEMPTED_CONTACT">Attempted Contact</option>
              <option value="CONNECTED">Connected</option>
              <option value="SITE_VISIT_REQUESTED">Site Visit Requested</option>
            </select>
          </div>
        </div>
      )}

      {/* ── 7. END FLOW ── */}
      {node.nodeType === 'end' && (
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600">
          <span className="font-bold text-zinc-900">End Automation:</span> Inbound execution completes here. Conversation remains available in 2-Way Live Team Inbox for manual sales takeover.
        </div>
      )}
    </div>
  );
};
