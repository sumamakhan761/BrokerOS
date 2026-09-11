// ============================================================================
// BrokerOS — Email Flow Branch Steps List (WhatsApp Parity for IF / ELSE)
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
  Mail,
  Sparkles,
  Tag as TagIcon,
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
import type { EmailFlowNode, EmailFlowNodeType } from './types';
import { EMAIL_NODE_TYPES_META } from './types';

interface BranchStepsListProps {
  branch: 'yes' | 'no';
  steps: EmailFlowNode[];
  existingTags?: { id: string; name: string; color: string }[];
  onAddStep: (type: EmailFlowNodeType) => void;
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
  const branchBadge = isYes ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300';
  const branchIcon = isYes ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <CircleSlash className="w-4 h-4 text-rose-600" />;
  const branchTitle = isYes ? 'IF TRUE / YES BRANCH' : 'IF FALSE / NO BRANCH';

  const addableTypes: EmailFlowNodeType[] = ['send_email', 'ai_agent', 'add_tag', 'end'];

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
            const meta = EMAIL_NODE_TYPES_META[step.nodeType] || EMAIL_NODE_TYPES_META.send_email;
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
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-md shrink-0 shadow-2xs',
                        meta.color.split(' ')[1],
                        meta.color.split(' ')[0],
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {idx + 1}. {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveStep(idx, -1)}
                      className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === steps.length - 1}
                      onClick={() => onMoveStep(idx, 1)}
                      className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveStep(idx)}
                      className="p-1 text-rose-500 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Remove step"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ChevronDown
                      className={cn('w-3.5 h-3.5 text-text-muted transition-transform ml-0.5', isExpanded && 'rotate-180')}
                    />
                  </div>
                </div>

                {/* Step Config Panel */}
                {isExpanded && (
                  <div className="p-3 border-t border-border-default/60 bg-bg-subtle/30 space-y-2.5 text-xs">
                    {/* Send Email */}
                    {step.nodeType === 'send_email' && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                            Reply Subject Line:
                          </label>
                          <Input
                            value={step.config.subject || ''}
                            onChange={(e) => onUpdateStep(idx, { subject: e.target.value })}
                            placeholder="Re: Your inquiry regarding {{project_name}}"
                            className="text-xs bg-bg-surface"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                            Email HTML Body:
                          </label>
                          <Textarea
                            rows={3}
                            value={step.config.bodyHtml || ''}
                            onChange={(e) => onUpdateStep(idx, { bodyHtml: e.target.value })}
                            placeholder="Hello {{lead_name}}, thank you for reaching out..."
                            className="text-xs bg-bg-surface font-sans"
                          />
                        </div>
                      </div>
                    )}

                    {/* AI Agent */}
                    {step.nodeType === 'ai_agent' && (
                      <div className="space-y-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Autonomous AI Concierge (Groq openai/gpt-oss-120b)</span>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                            Custom Prompt Instructions:
                          </label>
                          <Textarea
                            rows={2}
                            value={step.config.instructions || ''}
                            onChange={(e) => onUpdateStep(idx, { instructions: e.target.value })}
                            placeholder="e.g. Pitch the sample flat inspection and payment schedule."
                            className="text-xs bg-bg-surface"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-text-secondary">Max Replies:</span>
                          <select
                            value={step.config.maxTurns ?? 3}
                            onChange={(e) => onUpdateStep(idx, { maxTurns: parseInt(e.target.value, 10) })}
                            className="rounded-lg border border-border-default bg-bg-surface px-2 py-1 text-xs text-text-primary"
                          >
                            <option value={1}>1 turn</option>
                            <option value={2}>2 turns</option>
                            <option value={3}>3 turns</option>
                            <option value={5}>5 turns</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Add Tag */}
                    {step.nodeType === 'add_tag' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                          Assign CRM Tag:
                        </label>
                        <select
                          value={step.config.tagName || ''}
                          onChange={(e) => {
                            const name = e.target.value;
                            const matched = existingTags.find((t) => t.name === name);
                            onUpdateStep(idx, { tagName: name, color: matched?.color || '#8B5CF6' });
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
                        {step.config.tagName && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <TagIcon className="w-3 h-3 text-text-tertiary" />
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-2xs"
                              style={{ backgroundColor: step.config.color || '#8B5CF6' }}
                            >
                              {step.config.tagName}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* End Flow */}
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
      <div className="pt-1 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-full text-xs font-semibold rounded-xl border-dashed py-1.5 h-auto gap-1.5',
                isYes
                  ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                  : 'border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30',
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add step to {isYes ? 'YES' : 'NO'} branch</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-64 p-1.5">
            {addableTypes.map((type) => {
              const m = EMAIL_NODE_TYPES_META[type];
              const Icon = m.icon;
              return (
                <DropdownMenuItem
                  key={type}
                  onClick={() => onAddStep(type)}
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg cursor-pointer hover:bg-bg-subtle"
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-md shrink-0',
                      m.color.split(' ')[1],
                      m.color.split(' ')[0],
                    )}
                  >
                    <Icon className="w-3 h-3" />
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
  );
};
