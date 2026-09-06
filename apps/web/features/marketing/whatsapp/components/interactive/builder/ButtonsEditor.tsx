'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { INTERACTIVE_LIMITS } from '@brokeros/constants';
import type {
  InteractiveButtonsPayload,
  InteractiveMessagePayload,
} from '@brokeros/types';
import { slugify, nextId } from './utils';

export interface ButtonsEditorProps {
  value: InteractiveButtonsPayload;
  onChange: (p: InteractiveMessagePayload) => void;
  advanced: boolean;
}

export function ButtonsEditor({
  value,
  onChange,
  advanced,
}: ButtonsEditorProps) {
  const buttons = value.buttons;
  const update = (idx: number, patch: Partial<InteractiveButtonsPayload['buttons'][number]>) =>
    onChange({
      ...value,
      buttons: buttons.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
    });
  const add = () =>
    onChange({
      ...value,
      buttons: [
        ...buttons,
        { id: nextId(buttons.map((b) => b.id), 'btn_'), title: '' },
      ],
    });
  const remove = (idx: number) =>
    onChange({ ...value, buttons: buttons.filter((_, i) => i !== idx) });

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-text-muted">
        Buttons ({buttons.length}/{INTERACTIVE_LIMITS.maxButtons})
      </label>
      <div className="flex flex-col gap-2">
        {buttons.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle p-2"
          >
            {advanced && (
              <Input
                value={b.id}
                onChange={(e) => update(i, { id: slugify(e.target.value, `btn_${i + 1}`) })}
                placeholder="id"
                className="w-28 bg-bg-surface font-mono text-xs"
              />
            )}
            <Input
              value={b.title}
              maxLength={INTERACTIVE_LIMITS.buttonTitleMaxLength}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Button title"
              className="flex-1 bg-bg-surface text-xs"
            />
            <span className="w-10 shrink-0 text-right text-[10px] text-text-muted">
              {b.title.length}/{INTERACTIVE_LIMITS.buttonTitleMaxLength}
            </span>
            {buttons.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(i)}
                className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {buttons.length < INTERACTIVE_LIMITS.maxButtons && (
        <Button
          variant="outline"
          size="sm"
          onClick={add}
          className="mt-2 text-xs h-8 border-dashed"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Button
        </Button>
      )}
    </div>
  );
}
