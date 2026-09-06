'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Trash2,
  MessageSquare,
  FileText,
  Tag,
  TagIcon,
  UserCheck,
  PencilLine,
  Briefcase,
  Hourglass,
  GitBranch,
  Webhook,
  CircleSlash,
  Zap,
  Loader2,
  ArrowDown,
  ArrowUp,
  MousePointerClick,
  List,
  Save,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type {
  WhatsAppStepType,
  WhatsAppTriggerType,
  InteractiveMessagePayload,
} from '@brokeros/types';
import {
  InteractiveBuilder,
  blankButtonsPayload,
  blankListPayload,
} from '../interactive/InteractiveBuilder';
import { interactivePayloadPreviewText } from '../../lib/interactive';
import {
  childPath,
  insertAt,
  mapAtPath,
  moveAt,
  removeAt,
  type ParentScope,
  type StepPath,
} from '../../lib/builder-tree';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface BuilderStep {
  cid: string;
  step_type: WhatsAppStepType;
  step_config: Record<string, unknown>;
  branches?: { yes: BuilderStep[]; no: BuilderStep[] };
}

export interface BuilderInitial {
  id?: string;
  name: string;
  description?: string;
  trigger_type: WhatsAppTriggerType;
  trigger_config: Record<string, unknown>;
  is_active: boolean;
  steps: BuilderStep[];
}

export interface ServerStepNode {
  id: string;
  stepType?: string;
  step_type?: string;
  stepConfig?: Record<string, unknown>;
  step_config?: Record<string, unknown>;
  branches?: { yes?: ServerStepNode[]; no?: ServerStepNode[] };
}

interface StepMeta {
  label: string;
  icon: typeof Zap;
  accent: string;
  badge: string;
}

const STEP_META: Record<WhatsAppStepType, StepMeta> = {
  send_message: { label: 'Send Text Message', icon: MessageSquare, accent: 'border-l-brand-600', badge: 'bg-brand-500/10 text-brand-600' },
  send_buttons: { label: 'Send Reply Buttons', icon: MousePointerClick, accent: 'border-l-blue-600', badge: 'bg-blue-500/10 text-blue-600' },
  send_list: { label: 'Send List Menu', icon: List, accent: 'border-l-indigo-600', badge: 'bg-indigo-500/10 text-indigo-600' },
  send_template: { label: 'Send Approved Template (HSM)', icon: FileText, accent: 'border-l-emerald-600', badge: 'bg-emerald-500/10 text-emerald-600' },
  add_tag: { label: 'Add Tag to Contact', icon: Tag, accent: 'border-l-amber-600', badge: 'bg-amber-500/10 text-amber-600' },
  remove_tag: { label: 'Remove Tag from Contact', icon: TagIcon, accent: 'border-l-orange-600', badge: 'bg-orange-500/10 text-orange-600' },
  assign_conversation: { label: 'Assign Conversation to Agent', icon: UserCheck, accent: 'border-l-purple-600', badge: 'bg-purple-500/10 text-purple-600' },
  update_contact_field: { label: 'Update Contact Field', icon: PencilLine, accent: 'border-l-cyan-600', badge: 'bg-cyan-500/10 text-cyan-600' },
  create_deal: { label: 'Create Pipeline Deal', icon: Briefcase, accent: 'border-l-rose-600', badge: 'bg-rose-500/10 text-rose-600' },
  wait: { label: 'Delay / Wait', icon: Hourglass, accent: 'border-l-slate-400', badge: 'bg-slate-500/10 text-slate-600' },
  condition: { label: 'Branch / If Condition', icon: GitBranch, accent: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-600' },
  send_webhook: { label: 'Trigger External Webhook', icon: Webhook, accent: 'border-l-sky-600', badge: 'bg-sky-500/10 text-sky-600' },
  close_conversation: { label: 'Close Conversation', icon: CircleSlash, accent: 'border-l-zinc-500', badge: 'bg-zinc-500/10 text-zinc-600' },
};

const ADDABLE_STEPS: WhatsAppStepType[] = [
  'send_message',
  'send_buttons',
  'send_list',
  'send_template',
  'add_tag',
  'remove_tag',
  'assign_conversation',
  'update_contact_field',
  'create_deal',
  'wait',
  'condition',
  'send_webhook',
  'close_conversation',
];

const TRIGGER_OPTIONS: { value: WhatsAppTriggerType; label: string; desc: string }[] = [
  { value: 'new_message_received', label: 'Any Incoming Message', desc: 'Runs whenever a customer sends any WhatsApp message' },
  { value: 'first_inbound_message', label: 'First Inbound Message', desc: 'Triggered only when a new lead talks to us for the very first time' },
  { value: 'keyword_match', label: 'Keyword Match', desc: 'Runs when inbound text matches exact keywords or patterns (e.g. "price", "brochure")' },
  { value: 'interactive_reply', label: 'Interactive Reply', desc: 'Runs when a customer taps a specific button or selects a list menu option' },
  { value: 'new_contact_created', label: 'New Contact Created', desc: 'Triggered when a new contact is added or synced into WhatsApp CRM' },
  { value: 'conversation_assigned', label: 'Conversation Assigned', desc: 'Runs when an admin or manager assigns the chat to a sales rep' },
  { value: 'tag_added', label: 'Tag Added to Contact', desc: 'Runs when a specific tag (e.g. "VIP", "Site Visit") is attached' },
  { value: 'time_based', label: 'Scheduled / Inactivity Timer', desc: 'Triggered after no response for X hours or days' },
];

function cid(): string {
  return (
    'c_' +
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36))
  );
}

function blankConfig(type: WhatsAppStepType): Record<string, unknown> {
  switch (type) {
    case 'send_message':
      return { text: '' };
    case 'send_buttons':
      return blankButtonsPayload() as unknown as Record<string, unknown>;
    case 'send_list':
      return blankListPayload() as unknown as Record<string, unknown>;
    case 'send_template':
      return { template_name: '', language: 'en_US' };
    case 'add_tag':
    case 'remove_tag':
      return { tag_id: '' };
    case 'assign_conversation':
      return { mode: 'round_robin' };
    case 'update_contact_field':
      return { field: 'name', value: '' };
    case 'create_deal':
      return { pipeline_id: '', stage_id: '', title: '', value: 0 };
    case 'wait':
      return { amount: 1, unit: 'hours' };
    case 'condition':
      return { subject: 'tag_presence', operand: '', value: '' };
    case 'send_webhook':
      return { url: '', headers: {}, body_template: '' };
    case 'close_conversation':
      return {};
    default:
      return {};
  }
}

// ------------------------------------------------------------
// Resource Provider
// ------------------------------------------------------------

interface TagItem {
  id: string;
  name: string;
  color?: string;
}

interface TemplateItem {
  id: string;
  name: string;
  language?: string;
  category?: string;
}

interface CustomFieldItem {
  id: string;
  fieldName: string;
  fieldType: string;
}

interface PipelineItem {
  id: string;
  name: string;
}

interface StageItem {
  id: string;
  name: string;
  pipelineId: string;
  position: number;
}

interface MemberItem {
  id: string;
  name: string;
  email: string;
}

interface AutomationResources {
  tags: TagItem[];
  templates: TemplateItem[];
  customFields: CustomFieldItem[];
  pipelines: PipelineItem[];
  stages: StageItem[];
  members: MemberItem[];
}

const ResourcesContext = createContext<AutomationResources>({
  tags: [],
  templates: [],
  customFields: [],
  pipelines: [],
  stages: [],
  members: [],
});

function useResources() {
  return useContext(ResourcesContext);
}

function ResourcesProvider({ children }: { children: ReactNode }) {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [pipelines, setPipelines] = useState<PipelineItem[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [tagRes, tmplRes, cfRes, pipeRes, memRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/tags`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/templates`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/custom-fields`).catch(() => null),
          fetch(`${baseUrl}/api/marketing/whatsapp/pipelines`).catch(() => null),
          fetch(`${baseUrl}/api/leads/assignees`).catch(() => null),
        ]);

        if (cancelled) return;

        if (tagRes?.ok) {
          const t = await tagRes.json();
          setTags(Array.isArray(t) ? t : t?.tags || []);
        }
        if (tmplRes?.ok) {
          const m = await tmplRes.json();
          setTemplates(Array.isArray(m) ? m : m?.templates || m?.items || []);
        }
        if (cfRes?.ok) {
          const cf = await cfRes.json();
          setCustomFields(Array.isArray(cf) ? cf : cf?.fields || []);
        }
        if (pipeRes?.ok) {
          const p = await pipeRes.json();
          const plist = Array.isArray(p) ? p : p?.pipelines || [];
          setPipelines(plist);
          const stList = plist.flatMap((pl: any) => (pl.stages || []).map((s: any) => ({ ...s, pipelineId: pl.id })));
          setStages(stList);
        }
        if (memRes?.ok) {
          const mem = await memRes.json();
          setMembers(Array.isArray(mem) ? mem : mem?.users || mem?.data || []);
        }
      } catch (err) {
        // graceful degrade
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ResourcesContext.Provider value={{ tags, templates, customFields, pipelines, stages, members }}>
      {children}
    </ResourcesContext.Provider>
  );
}

// ------------------------------------------------------------
// Conversion Helpers
// ------------------------------------------------------------

export function toApiSteps(steps: BuilderStep[]): any[] {
  return steps.map((s, idx) => ({
    stepType: s.step_type,
    stepConfig: s.step_config,
    position: idx,
    branches: s.branches
      ? {
        yes: toApiSteps(s.branches.yes),
        no: toApiSteps(s.branches.no),
      }
      : undefined,
  }));
}

export function fromServerSteps(nodes: ServerStepNode[]): BuilderStep[] {
  return nodes.map((n) => ({
    cid: cid(),
    step_type: (n.stepType || n.step_type || 'send_message') as WhatsAppStepType,
    step_config: (n.stepConfig || n.step_config || {}) as Record<string, unknown>,
    branches:
      (n.stepType === 'condition' || n.step_type === 'condition')
        ? {
          yes: fromServerSteps(n.branches?.yes ?? []),
          no: fromServerSteps(n.branches?.no ?? []),
        }
        : undefined,
  }));
}

// ------------------------------------------------------------
// Main Builder Component
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// Step List & Node Component
// ------------------------------------------------------------

function StepsList({
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

// ------------------------------------------------------------
// Add Step Dropdown Button
// ------------------------------------------------------------

function AddStepButton({
  onAdd,
  label = 'Add step',
}: {
  onAdd: (type: WhatsAppStepType) => void;
  label?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-default bg-bg-surface px-3 py-1 text-xs font-medium text-text-muted hover:border-brand-600 hover:text-brand-600 transition-all shadow-xs"
        >
          <Plus className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
          <span>{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64 max-h-96 overflow-y-auto p-1.5">
        {ADDABLE_STEPS.map((type) => {
          const m = STEP_META[type];
          const Icon = m.icon;
          return (
            <DropdownMenuItem
              key={type}
              onClick={() => onAdd(type)}
              className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer hover:bg-bg-subtle"
            >
              <div className={cn('flex h-6 w-6 items-center justify-center rounded', m.badge)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-text-primary">{m.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ------------------------------------------------------------
// Step Config Form Components
// ------------------------------------------------------------

function StepConfigEditor({
  step,
  onChange,
  onUpdateStepType,
}: {
  step: BuilderStep;
  onChange: (cfg: Record<string, unknown>) => void;
  onUpdateStepType?: (type: WhatsAppStepType) => void;
}) {
  const { tags, templates, customFields, pipelines, stages, members } = useResources();
  const cfg = step.step_config || {};
  const set = (patch: Record<string, unknown>) => onChange({ ...cfg, ...patch });

  switch (step.step_type) {
    case 'send_message':
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-primary block">
            Message Text:
          </label>
          <Textarea
            value={(cfg.text as string) ?? ''}
            onChange={(e) => set({ text: e.target.value })}
            placeholder="Hi {{name}}, thanks for your interest in our project! Our sales advisor will reach out shortly."
            className="min-h-24 bg-bg-surface text-xs"
          />
          <p className="text-[11px] text-text-muted">
            Tip: You can use merge tags like <code className="text-brand-600 font-mono">{'{{name}}'}</code>, <code className="text-brand-600 font-mono">{'{{phone}}'}</code>, or <code className="text-brand-600 font-mono">{'{{project}}'}</code>.
          </p>
        </div>
      );

    case 'send_buttons':
    case 'send_list':
      return (
        <InteractiveBuilder
          value={cfg as unknown as InteractiveMessagePayload}
          onChange={(payload) => {
            onChange(payload as unknown as Record<string, unknown>);
            if (payload.kind === 'buttons' && step.step_type !== 'send_buttons') {
              onUpdateStepType?.('send_buttons');
            } else if (payload.kind === 'list' && step.step_type !== 'send_list') {
              onUpdateStepType?.('send_list');
            }
          }}
        />
      );

    case 'send_template':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Select Approved Meta WhatsApp Template (HSM):
            </label>
            <select
              value={`${cfg.template_name ?? ''}::${cfg.language ?? 'en_US'}`}
              onChange={(e) => {
                const [name, lang] = e.target.value.split('::');
                set({ template_name: name, language: lang || 'en_US' });
              }}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary focus:outline-none"
            >
              <option value="::">-- Pick an approved template --</option>
              {templates.map((tmpl) => {
                const lang = tmpl.language ?? 'en_US';
                return (
                  <option key={tmpl.id} value={`${tmpl.name}::${lang}`}>
                    {tmpl.name} ({lang})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-text-muted block mb-1">Template Name (Override)</label>
              <Input
                value={(cfg.template_name as string) ?? ''}
                onChange={(e) => set({ template_name: e.target.value })}
                placeholder="template_name"
                className="bg-bg-surface text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-text-muted block mb-1">Language Code</label>
              <Input
                value={(cfg.language as string) ?? 'en_US'}
                onChange={(e) => set({ language: e.target.value })}
                placeholder="en_US"
                className="bg-bg-surface text-xs"
              />
            </div>
          </div>
        </div>
      );

    case 'add_tag':
    case 'remove_tag':
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-primary block">
            Target Tag:
          </label>
          <select
            value={(cfg.tag_id as string) ?? ''}
            onChange={(e) => set({ tag_id: e.target.value })}
            className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
          >
            <option value="">-- Select a tag --</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Input
            value={(cfg.tag_id as string) ?? ''}
            onChange={(e) => set({ tag_id: e.target.value })}
            placeholder="Or type raw tag name/ID"
            className="bg-bg-surface text-xs font-mono"
          />
        </div>
      );

    case 'assign_conversation':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Assignment Mode:
            </label>
            <select
              value={(cfg.mode as string) ?? 'round_robin'}
              onChange={(e) => set({ mode: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="round_robin">Round Robin (Distribute evenly to online sales reps)</option>
              <option value="specific_agent">Specific Agent / Sales Exec</option>
            </select>
          </div>

          {cfg.mode === 'specific_agent' && (
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1">
                Select Team Member:
              </label>
              <select
                value={(cfg.user_id as string) ?? ''}
                onChange={(e) => set({ user_id: e.target.value })}
                className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
              >
                <option value="">-- Choose team member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      );

    case 'update_contact_field':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Field to Update:
            </label>
            <select
              value={(cfg.field as string) ?? 'name'}
              onChange={(e) => set({ field: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="name">Contact Name</option>
              <option value="email">Email Address</option>
              <option value="company">Company</option>
              {customFields.length > 0 && (
                <optgroup label="Custom Fields">
                  {customFields.map((f) => (
                    <option key={f.id} value={`custom:${f.id}`}>
                      {f.fieldName}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              New Value:
            </label>
            <Input
              value={(cfg.value as string) ?? ''}
              onChange={(e) => set({ value: e.target.value })}
              placeholder="Value or {{variable}}"
              className="bg-bg-surface text-xs"
            />
          </div>
        </div>
      );

    case 'create_deal':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Pipeline:
            </label>
            <select
              value={(cfg.pipeline_id as string) ?? ''}
              onChange={(e) => set({ pipeline_id: e.target.value, stage_id: '' })}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="">-- Select pipeline --</option>
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Initial Stage:
            </label>
            <select
              value={(cfg.stage_id as string) ?? ''}
              onChange={(e) => set({ stage_id: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="">-- Select stage --</option>
              {stages
                .filter((s) => !cfg.pipeline_id || s.pipelineId === cfg.pipeline_id)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-text-muted block mb-1">Deal Title</label>
              <Input
                value={(cfg.title as string) ?? ''}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="e.g. 2BHK Inquiry - {{name}}"
                className="bg-bg-surface text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] text-text-muted block mb-1">Deal Value (₹)</label>
              <Input
                type="number"
                value={(cfg.value as number) ?? 0}
                onChange={(e) => set({ value: Number(e.target.value) || 0 })}
                placeholder="10000000"
                className="bg-bg-surface text-xs"
              />
            </div>
          </div>
        </div>
      );

    case 'wait':
      return (
        <div className="flex items-center gap-3">
          <div className="w-28">
            <label className="text-xs font-semibold text-text-primary block mb-1">Amount</label>
            <Input
              type="number"
              min="1"
              value={(cfg.amount as number) ?? 1}
              onChange={(e) => set({ amount: Math.max(1, Number(e.target.value) || 1) })}
              className="bg-bg-surface text-xs"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-text-primary block mb-1">Unit</label>
            <select
              value={(cfg.unit as string) ?? 'hours'}
              onChange={(e) => set({ unit: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>
      );

    case 'condition':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Condition Criteria:
            </label>
            <select
              value={(cfg.subject as string) ?? 'tag_presence'}
              onChange={(e) => set({ subject: e.target.value })}
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-xs text-text-primary"
            >
              <option value="tag_presence">Contact has tag</option>
              <option value="contact_field">Contact field matches</option>
              <option value="message_content">Message text contains</option>
              <option value="time_of_day">Time of day / Business hours</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Target Value / Operand:
            </label>
            <Input
              value={(cfg.operand as string) ?? ''}
              onChange={(e) => set({ operand: e.target.value })}
              placeholder={
                cfg.subject === 'tag_presence'
                  ? 'Tag name (e.g. VIP)'
                  : cfg.subject === 'time_of_day'
                    ? '09:00-18:00'
                    : 'Keyword or expected value'
              }
              className="bg-bg-surface text-xs"
            />
          </div>
        </div>
      );

    case 'send_webhook':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Webhook URL:</label>
            <Input
              value={(cfg.url as string) ?? ''}
              onChange={(e) => set({ url: e.target.value })}
              placeholder="https://api.external-crm.com/hooks/lead"
              className="bg-bg-surface text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Payload JSON Template:</label>
            <Textarea
              value={(cfg.body_template as string) ?? ''}
              onChange={(e) => set({ body_template: e.target.value })}
              placeholder='{"lead_phone": "{{phone}}", "name": "{{name}}"}'
              className="min-h-20 bg-bg-surface text-xs font-mono"
            />
          </div>
        </div>
      );

    case 'close_conversation':
      return (
        <p className="text-xs text-text-muted italic">
          Automatically sets the active chat conversation status to "CLOSED". No additional configuration required.
        </p>
      );

    default:
      return null;
  }
}

function previewFor(step: BuilderStep): string {
  switch (step.step_type) {
    case 'send_message':
      return (step.step_config.text as string) || 'Click to compose text...';
    case 'send_buttons':
    case 'send_list':
      return interactivePayloadPreviewText(step.step_config as unknown as InteractiveMessagePayload) || 'Interactive options';
    case 'send_template':
      return (step.step_config.template_name as string) || 'Select approved template';
    case 'add_tag':
      return `Tag: ${(step.step_config.tag_id as string) || 'unassigned'}`;
    case 'remove_tag':
      return `Remove tag: ${(step.step_config.tag_id as string) || 'unassigned'}`;
    case 'assign_conversation':
      return `Mode: ${(step.step_config.mode as string) || 'round_robin'}`;
    case 'update_contact_field':
      return `Update ${(step.step_config.field as string) || 'field'}`;
    case 'create_deal':
      return `Create deal in pipeline`;
    case 'wait':
      return `Wait for ${step.step_config.amount ?? 1} ${step.step_config.unit ?? 'hours'}`;
    case 'condition':
      return `Check if ${step.step_config.subject ?? 'condition'} holds`;
    case 'send_webhook':
      return (step.step_config.url as string) || 'Configure webhook endpoint';
    case 'close_conversation':
      return 'Mark conversation as closed';
    default:
      return '';
  }
}
