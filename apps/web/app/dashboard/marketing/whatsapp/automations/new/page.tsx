'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AutomationBuilder,
  type BuilderInitial,
  type BuilderStep,
} from '@/features/marketing/whatsapp/components/automations/AutomationBuilder';
import {
  AUTOMATION_TEMPLATES,
  type TemplateSlug,
} from '@brokeros/constants';
import type { WhatsAppStepType, WhatsAppTriggerType } from '@brokeros/types';

export default function NewAutomationPage() {
  return (
    <Suspense fallback={null}>
      <NewAutomationPageInner />
    </Suspense>
  );
}

function NewAutomationPageInner() {
  const params = useSearchParams();
  const template = params.get('template') as TemplateSlug | null;

  const initial: BuilderInitial = useMemo(() => {
    if (template && (AUTOMATION_TEMPLATES as any)[template]) {
      const t = (AUTOMATION_TEMPLATES as any)[template];
      const steps = expandFromSeeds(
        t.steps.map((seed: any, idx: number) => ({
          index: idx,
          step_type: seed.step_type,
          step_config: seed.step_config as Record<string, unknown>,
          branch: seed.branch ?? null,
          parent_index: seed.parent_index ?? null,
        })),
      );
      return {
        name: t.name,
        description: t.description,
        trigger_type: t.trigger_type as WhatsAppTriggerType,
        trigger_config: t.trigger_config as Record<string, unknown>,
        is_active: false,
        steps,
      };
    }
    return {
      name: '',
      description: '',
      trigger_type: 'new_message_received' as WhatsAppTriggerType,
      trigger_config: {},
      is_active: false,
      steps: [],
    };
  }, [template]);

  return <AutomationBuilder initial={initial} />;
}

interface SeedRow {
  index: number;
  step_type: WhatsAppStepType;
  step_config: Record<string, unknown>;
  branch: 'yes' | 'no' | null;
  parent_index: number | null;
}

function uid(): string {
  return (
    'c_' +
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36))
  );
}

function expandFromSeeds(rows: SeedRow[]): BuilderStep[] {
  const nodes: BuilderStep[] = rows.map((r) => ({
    cid: uid(),
    step_type: r.step_type,
    step_config: r.step_config,
    branches:
      r.step_type === 'condition' ? { yes: [], no: [] } : undefined,
  }));
  const roots: BuilderStep[] = [];
  rows.forEach((r, i) => {
    if (r.parent_index == null) {
      roots.push(nodes[i]);
      return;
    }
    const parent = nodes[r.parent_index];
    if (!parent.branches) parent.branches = { yes: [], no: [] };
    parent.branches[r.branch ?? 'yes'].push(nodes[i]);
  });
  return roots;
}
