// ============================================================================
// BrokerOS — SMS Flow Branch Steps List (WhatsApp Parity for IF / ELSE)
// ============================================================================

'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  CircleSlash,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Tag,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SmsFlowNode, SmsFlowNodeType } from './types';
import { SMS_NODE_TYPES_META } from './types';
import { calculateSmsSegments } from '@brokeros/constants';

interface BranchStepsListProps {
  branch: 'yes' | 'no';
  steps: SmsFlowNode[];
  existingTags?: { id: string; name: string; color: string }[];
  onAddStep: (type: SmsFlowNodeType) => void;
  onUpdateStep: (index: number, configPatch: Record<string, any>) => void;
  onRemoveStep: (index: number) => void;
  onMoveStep: (index: number, dir: -1 | 1) => void;
}

export const BranchStepsList: React.FC<BranchStepsListProps> = ({
  branch,
  steps,
  existingTags = [],
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  onMoveStep,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const isYes = branch === 'yes';
  const branchBorder = isYes ? 'border-emerald-500/30' : 'border-rose-500/30';
  const branchBg = isYes ? 'bg-emerald-500/[0.02]' : 'bg-rose-500/[0.02]';
  const branchText = isYes ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400';
  const branchBadge = isYes
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300';
  const branchIcon = isYes ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <CircleSlash className="w-4 h-4 text-rose-600" />;
  const branchTitle = isYes ? 'IF TRUE / YES BRANCH' : 'IF FALSE / NO BRANCH';
  const addableTypes: SmsFlowNodeType[] = ['send_sms', 'ai_agent', 'add_tag', 'end'];

  return (
    <div className={cn('rounded-xl border-2 p-3.5 space-y-3', branchBorder, branchBg)}>
      {/* Branch Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border-default/60">
        <div className="flex items-center gap-1.5 font-bold text-xs tracking-wide">
          {branchIcon}
          <span className={branchText}>{branchTitle}</span>
        </div>
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', branchBadge)}>
          {steps.length} step{steps.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Steps List */}
      {steps.length === 0 ? (
        <div className="text-center py-6 px-3 bg-bg-surface/50 border border-dashed border-border-default rounded-xl">
          <p className="text-[11px] text-text-tertiary">
            No actions in this branch. Click below to add an action when condition is {isYes ? 'met' : 'not met'}.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {steps.map((step, idx) => {
            const meta = SMS_NODE_TYPES_META[step.nodeType] || SMS_NODE_TYPES_META.send_sms;
            const Icon = meta.icon;
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={step.nodeKey || idx}
                className="rounded-xl border border-border-default bg-bg-surface shadow-2xs overflow-hidden transition-all"
              >
                {/* Step Item Header */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-bg-subtle/50 select-none"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn('p-1 rounded-md text-xs', meta.color.split(' ')[1], meta.color.split(' ')[0])}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-text-primary">
                      {idx + 1}. {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveStep(idx, -1)}
                      className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 rounded hover:bg-bg-subtle"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => onMoveStep(idx, 1)}
                      className="p-1 text-text-tertiary hover:text-text-primary disabled:opacity-30 rounded hover:bg-bg-subtle"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveStep(idx)}
                      className="p-1 text-rose-500 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Expanded Config Editor */}
                {isExpanded && (
                  <div className="p-3 border-t border-border-subtle bg-bg-subtle/20 space-y-2.5 text-xs">
                    {/* 1. SEND SMS */}
                    {step.nodeType === 'send_sms' && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-text-secondary text-[11px]">
                            SMS Response Text:
                          </label>
                          {(() => {
                            const { segments, charCount } = calculateSmsSegments(step.config?.text || '');
                            return (
                              <span className="text-[10px] font-mono text-text-muted">
                                {charCount} chars • {segments} segment{segments > 1 ? 's' : ''}
                              </span>
                            );
                          })()}
                        </div>
                        <Textarea
                          rows={3}
                          value={step.config?.text || ''}
                          onChange={(e) => onUpdateStep(idx, { text: e.target.value })}
                          placeholder="Thank you for your inquiry! Would you like to schedule a site visit?"
                          className="text-xs"
                        />
                      </div>
                    )}

                    {/* 2. AI AGENT CONCIERGE */}
                    {step.nodeType === 'ai_agent' && (
                      <div className="space-y-2">
                        <label className="font-semibold text-text-secondary text-[11px]">
                          Custom AI Prompt Directive:
                        </label>
                        <Textarea
                          rows={2}
                          value={step.config?.customPrompt || ''}
                          onChange={(e) => onUpdateStep(idx, { customPrompt: e.target.value })}
                          placeholder="Answer the prospect with concise project pricing and booking availability in under 160 characters."
                          className="text-xs"
                        />
                      </div>
                    )}

                    {/* 3. ASSIGN TAG */}
                    {step.nodeType === 'add_tag' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                          Assign CRM Tag:
                        </label>
                        <select
                          value={step.config?.tagName || step.config?.tag || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            const matched = existingTags.find((t) => t.name === name);
                            onUpdateStep(idx, {
                              tagName: name,
                              tag: name,
                              color: matched?.color || '#8B5CF6',
                            });
                          }}
                          className="w-full rounded-lg border border-border-default bg-bg-surface px-2.5 py-1.5 text-xs text-text-primary"
                        >
                          <option value="">-- Choose tag --</option>
                          {existingTags.map((t) => (
                            <option key={t.id || t.name} value={t.name}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        {(step.config?.tagName || step.config?.tag) && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <Tag className="w-3 h-3 text-text-tertiary" />
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-2xs"
                              style={{ backgroundColor: step.config?.color || '#8B5CF6' }}
                            >
                              {step.config?.tagName || step.config?.tag}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. END FLOW */}
                    {step.nodeType === 'end' && (
                      <div className="p-2 bg-zinc-500/10 rounded-lg text-[11px] text-text-secondary flex items-center gap-1.5">
                        <Flag className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                        <span>Flow execution terminates at this step.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Step Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full text-xs font-bold gap-1.5 border-dashed">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Action to {isYes ? 'YES' : 'NO'} Branch</span>
            <ChevronDown className="w-3 h-3 ml-auto opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64 p-1">
          {addableTypes.map((type) => {
            const meta = SMS_NODE_TYPES_META[type];
            const Icon = meta.icon;
            return (
              <DropdownMenuItem
                key={type}
                onClick={() => onAddStep(type)}
                className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer"
              >
                <div className={cn('p-1 rounded-md', meta.color.split(' ')[1], meta.color.split(' ')[0])}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">{meta.label}</div>
                  <div className="text-[10px] text-text-tertiary">{meta.desc}</div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
