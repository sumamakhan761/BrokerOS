// ============================================================================
// BrokerOS — Email Flow Node Configuration Editor
// ============================================================================

'use client';

import React from 'react';
import { ArrowDown, Sparkles, UserPlus, Info } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/switch';
import type { EmailFlowNode } from './types';

interface FlowNodeConfigEditorProps {
  node: EmailFlowNode;
  allNodeKeys: string[];
  updateNodeConfig: (nodeKey: string, cfgPatch: Record<string, any>) => void;
}

export const FlowNodeConfigEditor: React.FC<FlowNodeConfigEditorProps> = ({
  node,
  allNodeKeys,
  updateNodeConfig,
}) => {
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
              placeholder="e.g. Always emphasize the 10:90 payment plan and recommend booking a visit this Sunday."
              className="text-xs bg-bg-subtle min-h-[60px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-bg-subtle border border-border-default rounded-xl">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Max AI Replies Before Human Handoff:
              </label>
              <select
                value={node.config.maxTurns ?? 3}
                onChange={(e) => updateNodeConfig(node.nodeKey, { maxTurns: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-border-default bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
              >
                <option value={1}>1 Reply (Single response, then handoff)</option>
                <option value={2}>2 Replies</option>
                <option value={3}>3 Replies (Recommended)</option>
                <option value={4}>4 Replies</option>
                <option value={5}>5 Replies</option>
              </select>
              <p className="text-[10px] text-text-tertiary mt-1">
                Prevents infinite bot loops and guarantees warm handoffs.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-xs font-semibold text-text-primary">Pause If Human Claimed</p>
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

      {/* ── If / Else Condition Branch ── */}
      {node.nodeType === 'condition' && (
        <div className="space-y-3 p-3 bg-bg-subtle border border-border-default rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Condition Type:
              </label>
              <select
                value={node.config.conditionType || 'keywords'}
                onChange={(e) => updateNodeConfig(node.nodeKey, { conditionType: e.target.value })}
                className="w-full rounded-lg border border-border-default bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
              >
                <option value="keywords">Inbound Message Contains Keywords</option>
                <option value="lead_temperature">Lead Temperature Equals</option>
                <option value="lead_status">Lead Status Equals</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Match Value:
              </label>
              {node.config.conditionType === 'lead_temperature' ? (
                <select
                  value={node.config.matchValue || 'HOT'}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { matchValue: e.target.value })}
                  className="w-full rounded-lg border border-border-default bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
                >
                  <option value="HOT">HOT</option>
                  <option value="WARM">WARM</option>
                  <option value="COLD">COLD</option>
                </select>
              ) : node.config.conditionType === 'lead_status' ? (
                <select
                  value={node.config.matchValue || 'INTERESTED'}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { matchValue: e.target.value })}
                  className="w-full rounded-lg border border-border-default bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
                >
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="NEW">NEW</option>
                  <option value="LOST">LOST</option>
                </select>
              ) : (
                <Input
                  value={node.config.keywords || ''}
                  onChange={(e) => updateNodeConfig(node.nodeKey, { keywords: e.target.value })}
                  placeholder="e.g. visit, price, brochure (comma separated)"
                  className="text-xs bg-bg-surface"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border-subtle">
            <div>
              <label className="text-xs font-semibold text-emerald-600 block mb-1">
                ✓ If MATCHES (True) go to:
              </label>
              <select
                value={node.config.if_true_node_key || ''}
                onChange={(e) => updateNodeConfig(node.nodeKey, { if_true_node_key: e.target.value })}
                className="w-full rounded-lg border border-emerald-500/40 bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
              >
                <option value="">-- Continue to next step --</option>
                {allNodeKeys
                  .filter((k) => k !== node.nodeKey)
                  .map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-red-500 block mb-1">
                ✗ If NOT MATCHED (False) go to:
              </label>
              <select
                value={node.config.if_false_node_key || ''}
                onChange={(e) => updateNodeConfig(node.nodeKey, { if_false_node_key: e.target.value })}
                className="w-full rounded-lg border border-red-500/40 bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
              >
                <option value="">-- Continue to next step --</option>
                {allNodeKeys
                  .filter((k) => k !== node.nodeKey)
                  .map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Update Lead Profile ── */}
      {node.nodeType === 'update_lead' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Status:</label>
            <select
              value={node.config.status || 'INTERESTED'}
              onChange={(e) => updateNodeConfig(node.nodeKey, { status: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1.5 text-xs text-text-primary"
            >
              <option value="INTERESTED">INTERESTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="SITE_VISIT_SCHEDULED">SITE_VISIT_SCHEDULED</option>
              <option value="LOST">LOST</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Temperature:</label>
            <select
              value={node.config.temperature || 'HOT'}
              onChange={(e) => updateNodeConfig(node.nodeKey, { temperature: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1.5 text-xs text-text-primary"
            >
              <option value="HOT">HOT</option>
              <option value="WARM">WARM</option>
              <option value="COLD">COLD</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Score Increment:</label>
            <Input
              type="number"
              value={node.config.scoreIncrement ?? 20}
              onChange={(e) =>
                updateNodeConfig(node.nodeKey, { scoreIncrement: parseInt(e.target.value, 10) || 0 })
              }
              className="text-xs bg-bg-subtle"
            />
          </div>
        </div>
      )}

      {/* ── Assign CRM Tag ── */}
      {node.nodeType === 'add_tag' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Tag Identifier:</label>
            <Input
              value={node.config.tagName || ''}
              onChange={(e) => updateNodeConfig(node.nodeKey, { tagName: e.target.value })}
              placeholder="SITE_VISIT_REQ"
              className="text-xs bg-bg-subtle font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">Tag Color:</label>
            <div className="flex items-center gap-2 pt-1">
              {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateNodeConfig(node.nodeKey, { color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    node.config.color === c ? 'scale-110 border-white shadow-xs' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Human Agent Handoff ── */}
      {node.nodeType === 'human_handoff' && (
        <div className="space-y-3">
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
            <UserPlus className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="space-y-1">
              <p className="font-semibold">Pre-Sales Manager Intake Queue</p>
              <p className="text-[11px] opacity-90">
                Lead status will be set to <code className="font-mono font-bold">INTERESTED</code>, <code className="font-mono font-bold">assignedUserId</code> will be cleared for manager triage, and AI autoreplies are immediately deactivated for this lead.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Handoff Priority:</label>
              <select
                value={node.config.priority || 'URGENT'}
                onChange={(e) => updateNodeConfig(node.nodeKey, { priority: e.target.value })}
                className="w-full rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1.5 text-xs text-text-primary"
              >
                <option value="URGENT">URGENT (Action Required)</option>
                <option value="HIGH">HIGH</option>
                <option value="NORMAL">NORMAL</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">Manager Handoff Note:</label>
              <Input
                value={node.config.note || ''}
                onChange={(e) => updateNodeConfig(node.nodeKey, { note: e.target.value })}
                placeholder="High-intent prospect requested site visit"
                className="text-xs bg-bg-subtle"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── General Next Step Transition (for linear nodes) ── */}
      {node.nodeType !== 'condition' && node.nodeType !== 'end' && (
        <div className="pt-2 flex items-center gap-2 border-t border-border-subtle">
          <ArrowDown className="h-3.5 w-3.5 text-text-muted" />
          <span className="text-[11px] font-medium text-text-muted">Then proceed to:</span>
          <select
            value={node.config.next_node_key || ''}
            onChange={(e) => updateNodeConfig(node.nodeKey, { next_node_key: e.target.value })}
            className="rounded-lg border border-border-default bg-bg-subtle px-2.5 py-1 text-xs text-text-primary"
          >
            <option value="">-- Next in sequence (Default) --</option>
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
  );
};
