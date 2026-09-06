'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

function slugify(s: string, fallback: string): string {
  const cleaned = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || fallback;
}

function nextId(existing: string[], prefix: string): string {
  const taken = new Set(existing);
  let n = existing.length + 1;
  while (taken.has(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}

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

interface InteractiveBuilderProps {
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
            <ListEditor value={value} onChange={onChange} advanced={advanced} />
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

function ButtonsEditor({
  value,
  onChange,
  advanced,
}: {
  value: InteractiveButtonsPayload;
  onChange: (p: InteractiveMessagePayload) => void;
  advanced: boolean;
}) {
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

function ListEditor({
  value,
  onChange,
  advanced,
}: {
  value: InteractiveListPayload;
  onChange: (p: InteractiveMessagePayload) => void;
  advanced: boolean;
}) {
  const sections = value.sections;
  const totalRows = sections.reduce((n, s) => n + s.rows.length, 0);
  const allRowIds = () => sections.flatMap((s) => s.rows.map((r) => r.id));

  const updateSection = (sIdx: number, patch: Partial<InteractiveListPayload['sections'][number]>) =>
    onChange({
      ...value,
      sections: sections.map((s, i) => (i === sIdx ? { ...s, ...patch } : s)),
    });
  const updateRow = (
    sIdx: number,
    rIdx: number,
    patch: Partial<InteractiveListPayload['sections'][number]['rows'][number]>,
  ) =>
    onChange({
      ...value,
      sections: sections.map((s, i) =>
        i === sIdx
          ? { ...s, rows: s.rows.map((r, j) => (j === rIdx ? { ...r, ...patch } : r)) }
          : s,
      ),
    });
  const addRow = (sIdx: number) =>
    onChange({
      ...value,
      sections: sections.map((s, i) =>
        i === sIdx
          ? { ...s, rows: [...s.rows, { id: nextId(allRowIds(), 'row_'), title: '' }] }
          : s,
      ),
    });
  const removeRow = (sIdx: number, rIdx: number) =>
    onChange({
      ...value,
      sections: sections.map((s, i) =>
        i === sIdx ? { ...s, rows: s.rows.filter((_, j) => j !== rIdx) } : s,
      ),
    });
  const addSection = () =>
    onChange({
      ...value,
      sections: [
        ...sections,
        { title: '', rows: [{ id: nextId(allRowIds(), 'row_'), title: '' }] },
      ],
    });
  const removeSection = (sIdx: number) =>
    onChange({ ...value, sections: sections.filter((_, i) => i !== sIdx) });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-text-muted">List Button Label</label>
          <span className="text-[10px] text-text-muted">
            {value.button_label.length}/{INTERACTIVE_LIMITS.buttonTitleMaxLength}
          </span>
        </div>
        <Input
          value={value.button_label}
          maxLength={INTERACTIVE_LIMITS.buttonTitleMaxLength}
          onChange={(e) => onChange({ ...value, button_label: e.target.value })}
          className="bg-bg-subtle text-text-primary text-xs"
        />
      </div>

      <label className="block text-xs font-medium text-text-muted">
        Sections & Options ({totalRows}/{INTERACTIVE_LIMITS.maxListRowsTotal} options)
      </label>

      {sections.map((section, sIdx) => (
        <div key={sIdx} className="rounded-xl border border-border-default bg-bg-subtle/60 p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <Input
              value={section.title ?? ''}
              onChange={(e) => updateSection(sIdx, { title: e.target.value })}
              placeholder="Section Title (e.g. 2 BHK Options)"
              className="flex-1 bg-bg-surface text-xs font-medium"
            />
            {sections.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSection(sIdx)}
                className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {section.rows.map((row, rIdx) => (
              <div key={rIdx} className="rounded-lg border border-border-default bg-bg-surface p-2.5">
                <div className="flex items-center gap-2">
                  {advanced && (
                    <Input
                      value={row.id}
                      onChange={(e) =>
                        updateRow(sIdx, rIdx, { id: slugify(e.target.value, `row_${rIdx + 1}`) })
                      }
                      placeholder="id"
                      className="w-24 bg-bg-subtle font-mono text-xs"
                    />
                  )}
                  <Input
                    value={row.title}
                    maxLength={INTERACTIVE_LIMITS.listRowTitleMaxLength}
                    onChange={(e) => updateRow(sIdx, rIdx, { title: e.target.value })}
                    placeholder="Row Title (e.g. Tower A - Corner Unit)"
                    className="flex-1 bg-bg-subtle text-xs"
                  />
                  <span className="w-10 shrink-0 text-right text-[10px] text-text-muted">
                    {row.title.length}/{INTERACTIVE_LIMITS.listRowTitleMaxLength}
                  </span>
                  {totalRows > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(sIdx, rIdx)}
                      className="text-red-500 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  value={row.description ?? ''}
                  maxLength={INTERACTIVE_LIMITS.listRowDescriptionMaxLength}
                  onChange={(e) => updateRow(sIdx, rIdx, { description: e.target.value })}
                  placeholder="Secondary description (optional, e.g. 1250 sqft with balcony)"
                  className="mt-2 bg-bg-subtle text-xs"
                />
              </div>
            ))}
          </div>
          {totalRows < INTERACTIVE_LIMITS.maxListRowsTotal && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow(sIdx)}
              className="mt-2.5 text-xs h-7 border-dashed"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Option
            </Button>
          )}
        </div>
      ))}

      {sections.length < INTERACTIVE_LIMITS.maxListSections &&
        totalRows < INTERACTIVE_LIMITS.maxListRowsTotal && (
          <Button
            variant="outline"
            size="sm"
            onClick={addSection}
            className="text-xs h-8 border-dashed self-start"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Section
          </Button>
        )}
    </div>
  );
}
