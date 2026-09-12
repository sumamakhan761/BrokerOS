// ============================================================================
// BrokerOS — SMS Template Picker Modal
// ============================================================================

import React, { useState } from 'react';
import { Search, X, FileText, Check, ShieldCheck } from 'lucide-react';
import { DEFAULT_SMS_TEMPLATES } from '@brokeros/constants';
import { calculateSmsSegments } from '@brokeros/constants';

interface SmsTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateContent: string) => void;
}

export const SmsTemplatePickerModal: React.FC<SmsTemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = DEFAULT_SMS_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Select SMS Template</h3>
              <p className="text-xs text-text-tertiary">Insert curated real-estate SMS templates with DLT compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border-default">
          <div className="relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search templates by name, category, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        {/* Templates List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-tertiary">No matching templates found</div>
          ) : (
            filtered.map((tmpl) => {
              const { charCount, segments } = calculateSmsSegments(tmpl.content);

              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate(tmpl.content);
                    onClose();
                  }}
                  className="p-4 bg-bg-base hover:bg-bg-subtle border border-border-default hover:border-amber-500/50 rounded-xl cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary group-hover:text-amber-600 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-surface border border-border-default text-text-tertiary font-semibold uppercase">
                        {tmpl.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Insert Template ↵
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed font-mono bg-bg-surface p-2.5 rounded-lg border border-border-subtle">
                    {tmpl.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-0.5">
                    <div className="flex items-center gap-2">
                      {tmpl.dltTemplateId && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                          <ShieldCheck className="w-3 h-3" />
                          <span>DLT: {tmpl.dltTemplateId}</span>
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px]">
                      <span>{charCount} chars</span>
                      <span> • </span>
                      <span className="font-bold text-text-secondary">{segments} seg{segments > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
