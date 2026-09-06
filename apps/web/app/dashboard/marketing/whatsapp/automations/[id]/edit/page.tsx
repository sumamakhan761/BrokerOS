'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  AutomationBuilder,
  fromServerSteps,
  type BuilderInitial,
  type ServerStepNode,
} from '@/features/marketing/whatsapp/components/automations/AutomationBuilder';
import type { WhatsAppTriggerType } from '@brokeros/types';

export default function EditAutomationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [initial, setInitial] = useState<BuilderInitial | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/automations/${id}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          if (!cancelled) setError('Failed to load automation details.');
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        setInitial({
          id: data.id,
          name: data.name ?? '',
          description: data.description ?? '',
          trigger_type: (data.triggerType || data.trigger_type) as WhatsAppTriggerType,
          trigger_config: (data.triggerConfig || data.trigger_config) ?? {},
          is_active: !!(data.isActive ?? data.is_active),
          steps: fromServerSteps((data.stepsTree || data.steps || []) as ServerStepNode[]),
        });
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Error loading automation');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <button
          onClick={() => router.push('/dashboard/marketing/whatsapp/automations')}
          className="text-xs text-brand-600 hover:underline"
        >
          Back to Automations
        </button>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  return <AutomationBuilder initial={initial} />;
}
