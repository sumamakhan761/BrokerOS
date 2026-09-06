'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { WhatsAppStepType } from '@brokeros/types';
import { ADDABLE_STEPS, STEP_META } from './types';

export function AddStepButton({
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
