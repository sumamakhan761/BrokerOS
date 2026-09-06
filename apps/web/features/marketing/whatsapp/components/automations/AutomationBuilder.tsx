'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import type { WhatsAppStepType, WhatsAppTriggerType } from '@brokeros/types';
import {
  insertAt,
  mapAtPath,
  moveAt,
  removeAt,
  type ParentScope,
  type StepPath,
} from '../../lib/builder-tree';
import type {
  BuilderStep,
  BuilderInitial,
  ServerStepNode,
} from './builder/types';
import { TRIGGER_OPTIONS } from './builder/types';
import {
  cid,
  blankConfig,
  toApiSteps,
  fromServerSteps,
} from './builder/utils';
import { ResourcesProvider } from './builder/ResourcesContext';
import { StepsList } from './builder/StepsList';
import { AddStepButton } from './builder/AddStepButton';

export type { BuilderStep, BuilderInitial, ServerStepNode };
export { toApiSteps, fromServerSteps };

export function AutomationBuilder({ initial }: { initial: BuilderInitial }) {
  return (
    <ResourcesProvider>
      <AutomationBuilderInner initial={initial} />
    </ResourcesProvider>
  );
}

function AutomationBuilderInner({ initial }: { initial: BuilderInitial }) {
  const router = useRouter();
  const isEditing = !!initial.id;
  const [state, setState] = useState<BuilderInitial>(initial);
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(initial.steps[0]?.cid ? [initial.steps[0].cid] : []),
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandStep = (id: string, parentCid?: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (parentCid) {
        next.add(parentCid);
      }
      return next;
    });
  };

  function patchTop<K extends keyof BuilderInitial>(key: K, value: BuilderInitial[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function updateStep(path: StepPath, updater: (s: BuilderStep) => BuilderStep) {
    setState((s) => ({ ...s, steps: mapAtPath(s.steps, path, updater) }));
  }

  function addStepAt(parent: ParentScope, index: number, type: WhatsAppStepType) {
    const node: BuilderStep = {
      cid: cid(),
      step_type: type,
      step_config: blankConfig(type),
      branches: type === 'condition' ? { yes: [], no: [] } : undefined,
    };
    setState((s) => ({ ...s, steps: insertAt(s.steps, parent, index, node) }));
    if (parent.kind === 'branch') {
      expandStep(node.cid, parent.parentCid);
    } else {
      expandStep(node.cid);
    }
  }

  function deleteStepAt(path: StepPath) {
    setState((s) => ({ ...s, steps: removeAt(s.steps, path) }));
  }

  function moveStepAt(path: StepPath, direction: -1 | 1) {
    setState((s) => ({ ...s, steps: moveAt(s.steps, path, direction) }));
  }

  async function save() {
    if (!state.name.trim()) {
      toast.error('Please provide an automation name.');
      return;
    }
    if (state.steps.length === 0) {
      toast.error('Add at least one action step to this automation.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: state.name.trim(),
        description: state.description?.trim() || null,
        triggerType: state.trigger_type,
        triggerConfig: state.trigger_config,
        isActive: state.is_active,
        steps: toApiSteps(state.steps),
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const url = isEditing
        ? `${baseUrl}/api/marketing/whatsapp/automations/${initial.id}`
        : `${baseUrl}/api/marketing/whatsapp/automations`;
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.message || body?.error || 'Failed to save automation');
      }

      toast.success(isEditing ? 'Automation updated successfully' : 'Automation created successfully');
      router.push('/dashboard/marketing/whatsapp/automations');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      {/* Header bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-default bg-bg-surface px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => router.push('/dashboard/marketing/whatsapp/automations')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <input
              value={state.name}
              onChange={(e) => patchTop('name', e.target.value)}
              placeholder="e.g. Instant Lead Welcome & Brochure Dispatch"
              className="w-full rounded-md bg-transparent text-lg font-bold text-text-primary placeholder:text-text-muted focus:bg-bg-subtle focus:outline-none px-2 py-0.5"
            />
            <input
              value={state.description ?? ''}
              onChange={(e) => patchTop('description', e.target.value)}
              placeholder="Optional description (e.g. Qualifies 2BHK/3BHK interest upon first ping)"
              className="w-full text-xs text-text-muted placeholder:text-text-muted/60 focus:outline-none px-2 mt-0.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle px-3 py-1.5 text-xs font-medium text-text-secondary">
            <span>{state.is_active ? 'Active' : 'Draft'}</span>
            <Switch
              checked={state.is_active}
              onCheckedChange={(v) => patchTop('is_active', !!v)}
            />
          </div>

          <Button
            onClick={save}
            disabled={saving}
            className="bg-brand-600 text-white hover:bg-brand-700 shadow-sm text-xs font-semibold px-4 py-2 h-9"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Workflow' : 'Publish Workflow'}
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main visual tree canvas */}
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Trigger Node */}
        <div className="rounded-2xl border-2 border-brand-500/30 bg-bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                  Step 0 — Trigger Event
                </span>
              </div>
              <h2 className="text-base font-semibold text-text-primary">
                When this happens:
              </h2>
            </div>
          </div>

          <div className="mt-4 space-y-4 pt-3 border-t border-border-default">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1.5">
                Trigger Type
              </label>
              <select
                value={state.trigger_type}
                onChange={(e) => patchTop('trigger_type', e.target.value as WhatsAppTriggerType)}
                className="w-full rounded-lg border border-border-default bg-bg-subtle px-3 py-2 text-sm text-text-primary focus:border-brand-600 focus:outline-none"
              >
                {TRIGGER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword match specifics */}
            {state.trigger_type === 'keyword_match' && (
              <div className="rounded-xl bg-bg-subtle p-3 space-y-2 border border-border-default">
                <label className="text-xs font-semibold text-text-primary block">
                  Comma-separated Keywords or Phrases:
                </label>
                <Input
                  value={(state.trigger_config?.keywords as string) ?? ''}
                  onChange={(e) =>
                    patchTop('trigger_config', {
                      ...state.trigger_config,
                      keywords: e.target.value,
                    })
                  }
                  placeholder="price, brochure, 2bhk, floorplan, booking"
                  className="bg-bg-surface text-xs"
                />
                <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="match_type"
                      checked={state.trigger_config?.match_type !== 'exact'}
                      onChange={() =>
                        patchTop('trigger_config', {
                          ...state.trigger_config,
                          match_type: 'contains',
                        })
                      }
                      className="text-brand-600"
                    />
                    Contains keyword anywhere
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="match_type"
                      checked={state.trigger_config?.match_type === 'exact'}
                      onChange={() =>
                        patchTop('trigger_config', {
                          ...state.trigger_config,
                          match_type: 'exact',
                        })
                      }
                      className="text-brand-600"
                    />
                    Exact match only
                  </label>
                </div>
              </div>
            )}

            {/* Interactive reply specifics */}
            {state.trigger_type === 'interactive_reply' && (
              <div className="rounded-xl bg-bg-subtle p-3 space-y-2 border border-border-default">
                <label className="text-xs font-semibold text-text-primary block">
                  Button ID or Row ID to match (optional):
                </label>
                <Input
                  value={(state.trigger_config?.button_id as string) ?? ''}
                  onChange={(e) =>
                    patchTop('trigger_config', {
                      ...state.trigger_config,
                      button_id: e.target.value,
                    })
                  }
                  placeholder="e.g. btn_yes, schedule_site_visit (leave blank for any button)"
                  className="bg-bg-surface text-xs font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tree flow line */}
        <div className="flex flex-col items-center">
          <div className="h-6 w-0.5 bg-border-default" />
          <AddStepButton onAdd={(type) => addStepAt({ kind: 'root' }, 0, type)} label="Add first step" />
          <div className="h-6 w-0.5 bg-border-default" />
        </div>

        {/* Root Steps List */}
        <StepsList
          steps={state.steps}
          basePath={[]}
          scope={{ kind: 'root' }}
          expandedIds={expandedIds}
          toggleExpanded={toggleExpanded}
          onUpdate={updateStep}
          onDelete={deleteStepAt}
          onMove={moveStepAt}
          onAdd={addStepAt}
        />
      </main>
    </div>
  );
}
