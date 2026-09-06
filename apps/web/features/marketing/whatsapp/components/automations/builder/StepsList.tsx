'use client';

import React from 'react';
import {
  ChevronDown,
  Trash2,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CircleSlash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WhatsAppStepType } from '@brokeros/types';
import {
  childPath,
  type ParentScope,
  type StepPath,
} from '../../../lib/builder-tree';
import type { BuilderStep } from './types';
import { STEP_META } from './types';
import { previewFor } from './utils';
import { StepConfigEditor } from './StepConfigEditor';
import { AddStepButton } from './AddStepButton';

export function StepsList({
  steps,
  basePath,
  scope,
  expandedIds,
  toggleExpanded,
  onUpdate,
  onDelete,
  onMove,
  onAdd,
}: {
  steps: BuilderStep[];
  basePath: StepPath;
  scope: ParentScope;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  onUpdate: (path: StepPath, updater: (s: BuilderStep) => BuilderStep) => void;
  onDelete: (path: StepPath) => void;
  onMove: (path: StepPath, dir: -1 | 1) => void;
  onAdd: (parent: ParentScope, index: number, type: WhatsAppStepType) => void;
}) {
  return (
    <div className="space-y-4">
      {steps.map((step, idx) => {
        const currentPath = childPath(basePath, scope, idx);
        const isExpanded = expandedIds.has(step.cid);
        const meta = STEP_META[step.step_type] || STEP_META.send_message;
        const Icon = meta.icon;

        return (
          <React.Fragment key={step.cid}>
            <div
              className={cn(
                'rounded-2xl border bg-bg-surface shadow-sm transition-all overflow-hidden border-l-4',
                meta.accent,
                isExpanded ? 'border-border-default ring-1 ring-brand-500/20' : 'border-border-default hover:border-text-muted/40',
              )}
            >
              {/* Header */}
              <div
                onClick={() => toggleExpanded(step.cid)}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', meta.badge)}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">
                      {idx + 1}. {meta.label}
                    </span>
                  </div>
                  <p className="truncate text-xs text-text-muted mt-0.5">
                    {previewFor(step)}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMove(currentPath, -1)}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === steps.length - 1}
                    onClick={() => onMove(currentPath, 1)}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(currentPath)}
                    className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete step"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-text-muted transition-transform ml-1',
                      isExpanded && 'rotate-180',
                    )}
                  />
                </div>
              </div>

              {/* Expanded Config Body */}
              {isExpanded && (
                <div className="border-t border-border-default bg-bg-subtle/40 p-4">
                  <StepConfigEditor
                    step={step}
                    onChange={(newConfig) =>
                      onUpdate(currentPath, (s) => ({ ...s, step_config: newConfig }))
                    }
                    onUpdateStepType={(newType) =>
                      onUpdate(currentPath, (s) => ({ ...s, step_type: newType }))
                    }
                  />
                </div>
              )}

              {/* Condition Branches */}
              {step.step_type === 'condition' && (
                <div className="border-t border-border-default bg-bg-subtle/80 p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* YES Branch */}
                    <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/[0.02] p-3.5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-emerald-600 font-bold text-xs tracking-wide">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>IF TRUE / YES BRANCH</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          {(step.branches?.yes || []).length} step{(step.branches?.yes || []).length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <StepsList
                        steps={step.branches?.yes || []}
                        basePath={currentPath}
                        scope={{ kind: 'branch', parentCid: step.cid, branch: 'yes' }}
                        expandedIds={expandedIds}
                        toggleExpanded={toggleExpanded}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onMove={onMove}
                        onAdd={onAdd}
                      />
                      <div className="pt-2">
                        <AddStepButton
                          onAdd={(type) =>
                            onAdd(
                              { kind: 'branch', parentCid: step.cid, branch: 'yes' },
                              step.branches?.yes?.length || 0,
                              type,
                            )
                          }
                          label="Add step to YES branch"
                        />
                      </div>
                    </div>

                    {/* NO Branch */}
                    <div className="rounded-xl border-2 border-rose-500/40 bg-rose-500/[0.02] p-3.5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-rose-500/20 text-rose-600 font-bold text-xs tracking-wide">
                        <div className="flex items-center gap-1.5">
                          <CircleSlash className="h-4 w-4 text-rose-600" />
                          <span>IF FALSE / NO BRANCH</span>
                        </div>
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                          {(step.branches?.no || []).length} step{(step.branches?.no || []).length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <StepsList
                        steps={step.branches?.no || []}
                        basePath={currentPath}
                        scope={{ kind: 'branch', parentCid: step.cid, branch: 'no' }}
                        expandedIds={expandedIds}
                        toggleExpanded={toggleExpanded}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onMove={onMove}
                        onAdd={onAdd}
                      />
                      <div className="pt-2">
                        <AddStepButton
                          onAdd={(type) =>
                            onAdd(
                              { kind: 'branch', parentCid: step.cid, branch: 'no' },
                              step.branches?.no?.length || 0,
                              type,
                            )
                          }
                          label="Add step to NO branch"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* In-between Add button */}
            <div className="flex flex-col items-center py-1">
              <div className="h-4 w-0.5 bg-border-default" />
              <AddStepButton onAdd={(type) => onAdd(scope, idx + 1, type)} />
              <div className="h-4 w-0.5 bg-border-default" />
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
