'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { INTERACTIVE_LIMITS } from '@brokeros/constants';
import type {
  InteractiveButtonsPayload,
  InteractiveListPayload,
  InteractiveMessagePayload,
} from '@brokeros/types';
import { validateInteractivePayload } from '../../lib/interactive';
import { InteractivePreview } from './InteractivePreview';
import { ButtonsEditor } from './builder/ButtonsEditor';
import { ListSectionsEditor } from './builder/ListSectionsEditor';

export function blankButtonsPayload(): InteractiveButtonsPayload {
  return {
    kind: 'buttons',
    body: '',
    buttons: [{ id: 'btn_1', title: '' }],
  };
}

export function blankListPayload(): InteractiveListPayload {
  return {
    kind: 'list',
    body: '',
    button_label: 'Menu',
    sections: [{ title: '', rows: [{ id: 'row_1', title: '' }] }],
  };
}

export interface InteractiveBuilderProps {
  value: InteractiveMessagePayload;
  onChange: (payload: InteractiveMessagePayload) => void;
  showPreview?: boolean;
}

export function InteractiveBuilder({
  value,
  onChange,
  showPreview = true,
}: InteractiveBuilderProps) {
  const [advanced, setAdvanced] = useState(false);
  const validation = validateInteractivePayload(value);

  const setField = (patch: Partial<InteractiveMessagePayload>) =>
    onChange({ ...value, ...patch } as InteractiveMessagePayload);

  const switchKind = (kind: 'buttons' | 'list') => {
    if (kind === value.kind) return;
    const shared = { body: value.body, header: value.header, footer: value.footer };
    onChange(
      kind === 'buttons'
        ? { ...blankButtonsPayload(), ...shared }
        : { ...blankListPayload(), ...shared },
    );
  };

  return (
    <div className="@container">
      <div className="flex flex-col gap-4 @2xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {/* Kind toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => switchKind('buttons')}
              className={cn(
                'flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                value.kind === 'buttons'
                  ? 'border-brand-600 bg-brand-500/10 text-brand-600'
                  : 'border-border-default bg-bg-subtle text-text-muted hover:text-text-primary',
              )}
            >
              Reply Buttons
            </button>
            <button
              type="button"
              onClick={() => switchKind('list')}
              className={cn(
                'flex-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
                value.kind === 'list'
                  ? 'border-brand-600 bg-brand-500/10 text-brand-600'
                  : 'border-border-default bg-bg-subtle text-text-muted hover:text-text-primary',
              )}
            >
              List Menu
            </button>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-text-muted">Message Body *</label>
              <span className="text-[10px] text-text-muted">
                {value.body.length}/{INTERACTIVE_LIMITS.bodyMaxLength}
              </span>
            </div>
            <Textarea
              value={value.body}
              maxLength={INTERACTIVE_LIMITS.bodyMaxLength}
              onChange={(e) => setField({ body: e.target.value })}
              placeholder="What the customer reads above the buttons or list options"
              className="min-h-20 bg-bg-subtle text-text-primary text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-text-muted">Header (optional)</label>
                <span className="text-[10px] text-text-muted">
                  {(value.header ?? '').length}/{INTERACTIVE_LIMITS.headerTextMaxLength}
                </span>
              </div>
              <Input
                value={value.header ?? ''}
                maxLength={INTERACTIVE_LIMITS.headerTextMaxLength}
                onChange={(e) => setField({ header: e.target.value })}
                className="bg-bg-subtle text-text-primary text-xs"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-text-muted">Footer (optional)</label>
                <span className="text-[10px] text-text-muted">
                  {(value.footer ?? '').length}/{INTERACTIVE_LIMITS.footerMaxLength}
                </span>
              </div>
              <Input
                value={value.footer ?? ''}
                maxLength={INTERACTIVE_LIMITS.footerMaxLength}
                onChange={(e) => setField({ footer: e.target.value })}
                className="bg-bg-subtle text-text-primary text-xs"
              />
            </div>
          </div>

          {value.kind === 'buttons' ? (
            <ButtonsEditor value={value} onChange={onChange} advanced={advanced} />
          ) : (
            <ListSectionsEditor value={value} onChange={onChange} advanced={advanced} />
          )}

          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={advanced}
              onChange={(e) => setAdvanced(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border-default text-brand-600 focus:ring-brand-500"
            />
            Show reply IDs (advanced / automation matching)
          </label>

          {!validation.ok && (
            <p className="text-xs text-red-500 font-medium">{validation.error}</p>
          )}
        </div>

        {showPreview && (
          <div className="flex shrink-0 flex-col gap-1.5 @2xl:w-[280px]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Live Preview
            </span>
            <div className="rounded-xl border border-border-default bg-bg-subtle/50 p-3">
              <InteractivePreview payload={value} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
