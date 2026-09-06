'use client';

import React from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { VariableMapping } from './types';

interface Step3PersonalizeProps {
  detectedVariables: string[];
  variableMappings: VariableMapping;
  setVariableMappings: React.Dispatch<React.SetStateAction<VariableMapping>>;
  previewBodyText: string;
  onBack: () => void;
  onNext: () => void;
}

export const Step3Personalize: React.FC<Step3PersonalizeProps> = ({
  detectedVariables,
  variableMappings,
  setVariableMappings,
  previewBodyText,
  onBack,
  onNext,
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Step 3 — Map Template Variables
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Replace placeholders like <code className="text-brand-600 font-mono">{'{{1}}'}</code> with contact details or static values.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Variable Mappings */}
        <div className="space-y-4">
          {detectedVariables.length === 0 ? (
            <div className="p-4 rounded-xl bg-bg-subtle text-xs text-text-muted italic">
              This template does not require any dynamic variables. You can proceed directly!
            </div>
          ) : (
            detectedVariables.map((v) => {
              const cur = variableMappings[v] || { type: 'field', value: 'name' };
              return (
                <div key={v} className="rounded-xl border border-border-default bg-bg-subtle/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-brand-600">
                      Variable {'{{' + v + '}}'}
                    </span>
                    <div className="flex gap-1 text-[11px]">
                      {(['field', 'static'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setVariableMappings((prev) => ({
                              ...prev,
                              [v]: { type: t, value: t === 'field' ? 'name' : '' },
                            }))
                          }
                          className={cn(
                            'rounded px-2 py-0.5 font-semibold capitalize',
                            cur.type === t
                              ? 'bg-brand-600 text-white'
                              : 'bg-bg-surface text-text-muted border border-border-default',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {cur.type === 'field' ? (
                    <select
                      value={cur.value}
                      onChange={(e) =>
                        setVariableMappings((prev) => ({
                          ...prev,
                          [v]: { ...cur, value: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-1.5 text-xs text-text-primary"
                    >
                      <option value="name">Contact Name</option>
                      <option value="phone">Phone Number</option>
                      <option value="email">Email Address</option>
                      <option value="company">Company</option>
                    </select>
                  ) : (
                    <Input
                      value={cur.value}
                      onChange={(e) =>
                        setVariableMappings((prev) => ({
                          ...prev,
                          [v]: { ...cur, value: e.target.value },
                        }))
                      }
                      placeholder="e.g. Prestige High Fields"
                      className="bg-bg-surface text-xs"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Live Chat Bubble Preview */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
            Live Message Preview:
          </span>
          <div className="rounded-2xl border border-border-default bg-bg-subtle/70 p-4 min-h-48">
            <div className="max-w-[280px] rounded-2xl bg-bg-surface border border-border-default p-3 shadow-xs">
              <p className="whitespace-pre-wrap text-xs text-text-primary leading-relaxed">
                {previewBodyText}
              </p>
              <span className="mt-2 block text-right text-[10px] text-text-muted">
                12:00 PM · WhatsApp HSM
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-border-default">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
        </Button>
        <Button
          onClick={onNext}
          className="bg-brand-600 text-white hover:bg-brand-700 text-xs"
        >
          Continue to Schedule
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
