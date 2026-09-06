'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { WhatsAppStepType, InteractiveMessagePayload } from '@brokeros/types';
import { InteractiveBuilder } from '../../interactive/InteractiveBuilder';
import { useResources } from './ResourcesContext';
import type { BuilderStep } from './types';

export function StepConfigEditor({
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
