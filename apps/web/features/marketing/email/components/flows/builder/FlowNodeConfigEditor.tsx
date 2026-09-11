// ============================================================================
// BrokerOS — Email Flow Node Configuration Editor
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Info, Tag as TagIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/switch';
import type { EmailFlowNode, EmailFlowNodeType } from './types';
import { EMAIL_NODE_TYPES_META } from './types';
import { BranchStepsList } from './BranchStepsList';

interface FlowNodeConfigEditorProps {
  node: EmailFlowNode;
  allNodes?: EmailFlowNode[];
  allNodeKeys: string[];
  existingTags?: { id: string; name: string; color: string }[];
  updateNodeConfig: (nodeKey: string, cfgPatch: Record<string, any>) => void;
}

const DEFAULT_PRESET_TAGS = [
  { id: 't1', name: 'SITE_VISIT_REQ', color: '#10B981' },
  { id: 't2', name: 'PRICING_INQUIRY', color: '#3B82F6' },
  { id: 't3', name: 'BROCHURE_DOWNLOAD', color: '#8B5CF6' },
  { id: 't4', name: 'CALLBACK_REQUESTED', color: '#F59E0B' },
  { id: 't5', name: 'HIGH_INTENT', color: '#EC4899' },
];

function getDefaultBranchStepConfig(
  type: EmailFlowNodeType,
  availableTags: { id: string; name: string; color: string }[],
): Record<string, any> {
  switch (type) {
    case 'send_email':
      return {
        subject: 'Re: Your inquiry regarding {{project_name}}',
        bodyHtml: '<p>Hello {{lead_name}},</p><p>Thank you for reaching out. Here are the requested property details...</p>',
      };
    case 'ai_agent':
      return {
        provider: 'groq',
        model: 'openai/gpt-oss-120b',
        instructions: 'Answer pricing or scheduling queries and recommend booking an on-site flat tour.',
        maxTurns: 3,
        stopIfHumanActive: true,
      };
    case 'add_tag':
      return {
        tagName: availableTags[0]?.name || 'SITE_VISIT_REQ',
        color: availableTags[0]?.color || '#8B5CF6',
      };
    case 'end':
      return {};
    default:
      return {};
  }
}

export const FlowNodeConfigEditor: React.FC<FlowNodeConfigEditorProps> = ({
  node,
  allNodes = [],
  allNodeKeys,
  existingTags = [],
  updateNodeConfig,
}) => {
  const [loadedTags, setLoadedTags] = useState<{ id: string; name: string; color: string }[]>(existingTags);

  useEffect(() => {
    if (existingTags && existingTags.length > 0) {
      setLoadedTags(existingTags);
      return;
    }
    // Fetch tags from settings if not passed via props
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    fetch(`${baseUrl}/api/marketing/email/tags`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLoadedTags(data);
        }
      })
      .catch(() => {});
  }, [existingTags]);

  const availableTags = loadedTags.length > 0 ? loadedTags : DEFAULT_PRESET_TAGS;

  const insertMergeTag = (tag: string, field: 'subject' | 'bodyHtml') => {
    const current = node.config[field] || '';
    updateNodeConfig(node.nodeKey, { [field]: `${current} ${tag}`.trim() });
  };

  return (
    <div className="space-y-4 pt-3 border-t border-border-default">
      {/* ── Start Entry ── */}
      {node.nodeType === 'start' && (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Flow Inbound Entry Point</p>
            <p className="text-[11px] mt-0.5 opacity-90">
              When an inbound email reply matches the flow trigger, execution begins here and evaluates down the sequence.
            </p>
          </div>
        </div>
      )}

      {/* ── Send Email Reply ── */}
      {node.nodeType === 'send_email' && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary">Reply Subject Line:</label>
              <div className="flex items-center gap-1">
                {['{{project_name}}', '{{lead_name}}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertMergeTag(tag, 'subject')}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-bg-subtle hover:bg-bg-base border border-border-default font-mono text-text-muted"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <Input
              value={node.config.subject || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { subject: e.target.value })}
              placeholder="Re: Your inquiry regarding {{project_name}}"
              className="text-xs bg-bg-subtle"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary">Email HTML / Markdown Body:</label>
              <div className="flex items-center gap-1">
                {['{{lead_name}}', '{{project_name}}', '{{brochure_url}}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertMergeTag(tag, 'bodyHtml')}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-bg-subtle hover:bg-bg-base border border-border-default font-mono text-text-muted"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              rows={4}
              value={node.config.bodyHtml || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { bodyHtml: e.target.value })}
              placeholder="Hello {{lead_name}}, thank you for reaching out..."
              className="text-xs bg-bg-subtle font-sans min-h-[90px]"
            />
          </div>
        </div>
      )}

      {/* ── AI Concierge Autoreply ── */}
      {node.nodeType === 'ai_agent' && (
        <div className="space-y-3">
          <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl text-xs text-purple-700 dark:text-purple-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-purple-600" />
            <div className="space-y-1">
              <p className="font-semibold">Autonomous Real Estate AI (Groq openai/gpt-oss-120b)</p>
              <p className="text-[11px] opacity-90">
                Dynamically injects project highlights, brochures, starting prices, and personalized site visit invitations into the reply.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Custom Prompt Instructions (Optional):
            </label>
            <Textarea
              rows={2}
              value={node.config.instructions || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { instructions: e.target.value })}
              placeholder="e.g. Always emphasize the 10:90 payment plan and recommend booking an on-site flat tour."
              className="text-xs bg-bg-subtle min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-bg-subtle border border-border-default rounded-xl">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Max AI Replies Per Prospect:
              </label>
              <select
                value={node.config.maxTurns ?? 3}
                onChange={(e) => updateNodeConfig(node.nodeKey, { maxTurns: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-border-default bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
              >
                <option value={1}>1 Reply (Single response)</option>
                <option value={2}>2 Replies</option>
                <option value={3}>3 Replies (Recommended)</option>
                <option value={4}>4 Replies</option>
                <option value={5}>5 Replies</option>
              </select>
              <p className="text-[10px] text-text-tertiary mt-1">
                Prevents infinite bot loops and maintains high-touch engagement.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Pause If Human Active</p>
                  <p className="text-[10px] text-text-tertiary">Skip AI if sales exec is assigned</p>
                </div>
                <Switch
                  checked={node.config.stopIfHumanActive ?? true}
                  onCheckedChange={(val) => updateNodeConfig(node.nodeKey, { stopIfHumanActive: val })}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Auto-Handoff on Max</p>
                  <p className="text-[10px] text-text-tertiary">Route to Pre-Sales queue after limit</p>
                </div>
                <Switch
                  checked={node.config.handoffOnMax ?? true}
                  onCheckedChange={(val) => updateNodeConfig(node.nodeKey, { handoffOnMax: val })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── If / Else Condition Branch (WhatsApp Visual Parity) ── */}
      {node.nodeType === 'condition' && (
        <div className="space-y-4">
          {/* Condition Criteria Selector */}
          <div className="p-3.5 bg-bg-subtle border border-border-default rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-text-secondary">Condition Evaluation Criteria:</label>
              <select
                value={node.config.criteriaType || 'keywords'}
                onChange={(e) => updateNodeConfig(node.nodeKey, { criteriaType: e.target.value })}
                className="rounded-lg border border-border-default bg-bg-surface px-2.5 py-1 text-xs text-text-primary"
              >
                <option value="keywords">Inbound reply contains keywords</option>
                <option value="tag">Prospect has CRM tag</option>
                <option value="budget">Prospect budget greater than or equal to</option>
              </select>
            </div>

            {(!node.config.criteriaType || node.config.criteriaType === 'keywords') && (
              <div>
                <label className="text-[11px] font-medium text-text-secondary block mb-1">
                  Target Keywords (comma-separated):
                </label>
                <Input
                  value={node.config.keywords || ''}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { keywords: e.target.value })}
                  placeholder="e.g. visit, price, flat, tour, brochure"
                  className="text-xs bg-bg-surface"
                />
                <p className="text-[10px] text-text-tertiary mt-1">
                  Evaluates to <span className="text-emerald-600 font-semibold">TRUE / YES</span> if the prospect email matches any of these keywords.
                </p>
              </div>
            )}

            {node.config.criteriaType === 'tag' && (
              <div>
                <label className="text-[11px] font-medium text-text-secondary block mb-1">
                  Required CRM Tag:
                </label>
                <select
                  value={node.config.targetTag || ''}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { targetTag: e.target.value })}
                  className="w-full rounded-lg border border-border-default bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
                >
                  <option value="">-- Choose required tag --</option>
                  {availableTags.map((t) => (
                    <option key={t.id || t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {node.config.criteriaType === 'budget' && (
              <div>
                <label className="text-[11px] font-medium text-text-secondary block mb-1">
                  Minimum Budget Threshold (₹):
                </label>
                <Input
                  type="number"
                  value={node.config.minBudget || ''}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { minBudget: Number(e.target.value) || 0 })}
                  placeholder="e.g. 10000000"
                  className="text-xs bg-bg-surface"
                />
              </div>
            )}
          </div>

          {/* Side-by-Side YES / NO Visual Branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <BranchStepsList
              branch="yes"
              steps={node.branches?.yes || node.config?.branches?.yes || []}
              existingTags={availableTags}
              onAddStep={(type) => {
                const currentYes = node.branches?.yes || node.config?.branches?.yes || [];
                const newStep: EmailFlowNode = {
                  nodeKey: `yes_${type}_${Date.now().toString(36).slice(-4)}`,
                  nodeType: type,
                  config: getDefaultBranchStepConfig(type, availableTags),
                };
                const updatedBranches = {
                  yes: [...currentYes, newStep],
                  no: node.branches?.no || node.config?.branches?.no || [],
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
              onUpdateStep={(stepIdx, patch) => {
                const currentYes = [...(node.branches?.yes || node.config?.branches?.yes || [])];
                currentYes[stepIdx] = {
                  ...currentYes[stepIdx],
                  config: { ...currentYes[stepIdx].config, ...patch },
                };
                const updatedBranches = {
                  yes: currentYes,
                  no: node.branches?.no || node.config?.branches?.no || [],
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
              onRemoveStep={(stepIdx) => {
                const currentYes = node.branches?.yes || node.config?.branches?.yes || [];
                const updatedBranches = {
                  yes: currentYes.filter((_: EmailFlowNode, i: number) => i !== stepIdx),
                  no: node.branches?.no || node.config?.branches?.no || [],
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
              onMoveStep={(stepIdx, dir) => {
                const currentYes = [...(node.branches?.yes || node.config?.branches?.yes || [])];
                const targetIdx = stepIdx + dir;
                if (targetIdx < 0 || targetIdx >= currentYes.length) return;
                const tmp = currentYes[stepIdx];
                currentYes[stepIdx] = currentYes[targetIdx];
                currentYes[targetIdx] = tmp;
                const updatedBranches = {
                  yes: currentYes,
                  no: node.branches?.no || node.config?.branches?.no || [],
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
            />

            <BranchStepsList
              branch="no"
              steps={node.branches?.no || node.config?.branches?.no || []}
              existingTags={availableTags}
              onAddStep={(type) => {
                const currentNo = node.branches?.no || node.config?.branches?.no || [];
                const newStep: EmailFlowNode = {
                  nodeKey: `no_${type}_${Date.now().toString(36).slice(-4)}`,
                  nodeType: type,
                  config: getDefaultBranchStepConfig(type, availableTags),
                };
                const updatedBranches = {
                  yes: node.branches?.yes || node.config?.branches?.yes || [],
                  no: [...currentNo, newStep],
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
              onUpdateStep={(stepIdx, patch) => {
                const currentNo = [...(node.branches?.no || node.config?.branches?.no || [])];
                currentNo[stepIdx] = {
                  ...currentNo[stepIdx],
                  config: { ...currentNo[stepIdx].config, ...patch },
                };
                const updatedBranches = {
                  yes: node.branches?.yes || node.config?.branches?.yes || [],
                  no: currentNo,
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
              onRemoveStep={(stepIdx) => {
                const currentNo = node.branches?.no || node.config?.branches?.no || [];
                const updatedBranches = {
                  yes: node.branches?.yes || node.config?.branches?.yes || [],
                  no: currentNo.filter((_: EmailFlowNode, i: number) => i !== stepIdx),
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
              onMoveStep={(stepIdx, dir) => {
                const currentNo = [...(node.branches?.no || node.config?.branches?.no || [])];
                const targetIdx = stepIdx + dir;
                if (targetIdx < 0 || targetIdx >= currentNo.length) return;
                const tmp = currentNo[stepIdx];
                currentNo[stepIdx] = currentNo[targetIdx];
                currentNo[targetIdx] = tmp;
                const updatedBranches = {
                  yes: node.branches?.yes || node.config?.branches?.yes || [],
                  no: currentNo,
                };
                updateNodeConfig(node.nodeKey, { branches: updatedBranches });
              }}
            />
          </div>
        </div>
      )}

      {/* ── Assign CRM Tag ── */}
      {node.nodeType === 'add_tag' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Select CRM Tag (Configured in Email Settings):
            </label>
            <select
              value={node.config.tagName || ''}
              onChange={(e) => {
                const selectedName = e.target.value;
                const matched = availableTags.find((t) => t.name === selectedName);
                updateNodeConfig(node.nodeKey, {
                  tagName: selectedName,
                  color: matched?.color || '#8B5CF6',
                });
              }}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="">-- Select an existing tag --</option>
              {availableTags.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {node.config.tagName && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-subtle border border-border-subtle text-xs">
              <TagIcon className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-text-secondary">Assigned CRM Tag:</span>
              <span
                className="px-2 py-0.5 rounded-md font-mono font-bold text-white text-[11px] shadow-2xs"
                style={{ backgroundColor: node.config.color || '#8B5CF6' }}
              >
                {node.config.tagName}
              </span>
            </div>
          )}

          <p className="text-[11px] text-text-tertiary">
            CRM tags are centrally created and managed in{' '}
            <a
              href="/dashboard/marketing/email/settings"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 underline font-semibold hover:text-brand-700"
            >
              Email Settings → Tags
            </a>{' '}
            to avoid duplicate typos.
          </p>
        </div>
      )}

      {/* ── End Flow ── */}
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
