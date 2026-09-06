'use client';

import React from 'react';
import { Search, Loader2, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { WhatsAppTemplate } from '../../../../types';

interface Step1TemplateSelectProps {
  templates: WhatsAppTemplate[];
  selectedTemplate: WhatsAppTemplate | null;
  setSelectedTemplate: (t: WhatsAppTemplate) => void;
  loadingTemplates: boolean;
  templateSearch: string;
  setTemplateSearch: (s: string) => void;
  onNext: () => void;
}

export const Step1TemplateSelect: React.FC<Step1TemplateSelectProps> = ({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  loadingTemplates,
  templateSearch,
  setTemplateSearch,
  onNext,
}) => {
  return (
    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 space-y-6 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-text-primary">
          Step 1 — Select Approved WhatsApp HSM Template
        </h3>
        <p className="text-xs text-text-muted mt-1">
          Only templates pre-approved by Meta can be used for outbound broadcasts.
        </p>
      </div>

      <div className="relative">
        <Search className="h-4 w-4 text-text-muted absolute left-3.5 top-3" />
        <Input
          value={templateSearch}
          onChange={(e) => setTemplateSearch(e.target.value)}
          placeholder="Search approved templates by name..."
          className="pl-10 text-xs bg-bg-subtle"
        />
      </div>

      {loadingTemplates ? (
        <div className="text-center py-12 text-xs text-text-muted">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-600" />
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border-default text-xs text-text-muted">
          No approved templates found. Go to Templates to sync or create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto p-1">
          {templates
            .filter((t) => t.name.toLowerCase().includes(templateSearch.toLowerCase()))
            .map((t) => {
              const isSelected = selectedTemplate?.id === t.id;
              const bodyText = t.bodyText || (t as any).body_text || '';
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className={cn(
                    'flex flex-col justify-between rounded-xl border p-4 text-left transition-all cursor-pointer select-none',
                    isSelected
                      ? 'border-brand-600 bg-brand-500/5 ring-1 ring-brand-500/30'
                      : 'border-border-default bg-bg-surface hover:border-brand-500/40 hover:bg-bg-subtle/50',
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="text-xs font-bold text-text-primary truncate">{t.name}</h4>
                      <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 border border-purple-500/20">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted line-clamp-3 leading-relaxed">
                      {bodyText}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border-default flex items-center justify-between text-[10px] text-text-muted">
                    <span>Language: {t.language || 'en_US'}</span>
                    {isSelected && (
                      <span className="text-brand-600 font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border-default">
        <Button
          onClick={() => {
            if (!selectedTemplate) {
              toast.error('Please select a template');
              return;
            }
            onNext();
          }}
          disabled={!selectedTemplate}
          className="bg-brand-600 text-white hover:bg-brand-700 text-xs"
        >
          Continue to Audience
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
