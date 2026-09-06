'use client';

import React from 'react';
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { WhatsAppTemplate } from '../../../types';

interface ContactSendTemplateTabProps {
  templates: WhatsAppTemplate[];
  selectedTemplate: WhatsAppTemplate | null;
  setSelectedTemplate: (t: WhatsAppTemplate | null) => void;
  templateSuccess: string | null;
  templateError: string | null;
  sendingTemplate: boolean;
  phone?: string;
  handleSendTemplate: () => Promise<void>;
}

export const ContactSendTemplateTab: React.FC<ContactSendTemplateTabProps> = ({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  templateSuccess,
  templateError,
  sendingTemplate,
  phone,
  handleSendTemplate,
}) => {
  return (
    <div className="space-y-4">
      {templateSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{templateSuccess}</span>
        </div>
      )}

      {templateError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{templateError}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Select Approved Meta HSM Template
        </label>
        <select
          value={selectedTemplate?.name || ''}
          onChange={(e) => {
            const tpl = templates.find((t) => t.name === e.target.value);
            setSelectedTemplate(tpl || null);
          }}
          className="w-full px-3.5 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
        >
          <option value="">Choose a template...</option>
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.name}>
              {tpl.name} ({tpl.language})
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <div className="p-4 bg-bg-base rounded-2xl border border-border-default space-y-3">
          <span className="text-[11px] font-semibold text-text-tertiary uppercase">
            Template Preview
          </span>
          {selectedTemplate.headerText && (
            <p className="font-bold text-xs text-text-primary">
              {selectedTemplate.headerText}
            </p>
          )}
          <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
            {selectedTemplate.bodyText}
          </p>
          {selectedTemplate.footerText && (
            <p className="text-[11px] text-text-tertiary">
              {selectedTemplate.footerText}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSendTemplate}
          disabled={!selectedTemplate || sendingTemplate}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors shadow-2xs"
        >
          {sendingTemplate ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Send to {phone}</span>
        </button>
      </div>
    </div>
  );
};
