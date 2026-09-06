'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { INTERACTIVE_LIMITS } from '@brokeros/constants';
import type {
  InteractiveListPayload,
  InteractiveMessagePayload,
} from '@brokeros/types';
import { slugify, nextId } from './utils';

export interface ListSectionsEditorProps {
  value: InteractiveListPayload;
  onChange: (p: InteractiveMessagePayload) => void;
  advanced: boolean;
}

export function ListSectionsEditor({
  value,
  onChange,
  advanced,
}: ListSectionsEditorProps) {
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
