// ============================================================================
// BrokerOS — WhatsApp Template Picker Modal
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Search, X, Check, FileText } from 'lucide-react';
import type { WhatsAppTemplate } from '../../types';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WhatsAppTemplate, params: string[]) => void;
  accountId?: string;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  accountId,
}) => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [params, setParams] = useState<string[]>([]);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!isOpen) return;

    async function fetchTemplates() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (accountId) query.set('accountId', accountId);
        query.set('status', 'APPROVED');

        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/templates?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [isOpen, accountId, baseUrl]);

  if (!isOpen) return null;

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.bodyText.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (tmpl: WhatsAppTemplate) => {
    setSelectedTemplate(tmpl);
    // Count {{n}} placeholders
    const matches = tmpl.bodyText.match(/\{\{\d+\}\}/g) || [];
    setParams(new Array(matches.length).fill(''));
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, params);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-bg-surface border border-border-default rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-base">Select WhatsApp Template</h3>
              <p className="text-xs text-text-tertiary">Only Meta-approved HSM templates can initiate conversations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary rounded-lg hover:bg-bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {!selectedTemplate ? (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search approved templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-default rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Template List */}
              {loading ? (
                <div className="text-center py-10 text-sm text-text-tertiary">Loading templates...</div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-10 text-sm text-text-tertiary">
                  No approved templates found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {filteredTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelect(tmpl)}
                      className="p-3.5 border border-border-default rounded-xl hover:border-brand-500 hover:bg-brand-50/20 cursor-pointer transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary text-sm">{tmpl.name}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                          {tmpl.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {tmpl.bodyText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Configure Selected Template Parameters */
            <div className="space-y-4">
              <div className="p-4 bg-bg-base rounded-xl border border-border-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-text-primary">{selectedTemplate.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    Change Template
                  </button>
                </div>
                {selectedTemplate.headerText && (
                  <p className="text-xs font-semibold text-text-primary mb-1">{selectedTemplate.headerText}</p>
                )}
                <p className="text-xs text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {selectedTemplate.bodyText}
                </p>
                {selectedTemplate.footerText && (
                  <p className="text-[11px] text-text-tertiary mt-2">{selectedTemplate.footerText}</p>
                )}
              </div>

              {params.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Template Variables
                  </h4>
                  {params.map((val, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs font-mono px-2 py-1 bg-bg-muted rounded text-text-secondary">
                        {`{{${idx + 1}}}`}
                      </span>
                      <input
                        type="text"
                        placeholder={`Value for {{${idx + 1}}}`}
                        value={val}
                        onChange={(e) => {
                          const updated = [...params];
                          updated[idx] = e.target.value;
                          setParams(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-bg-base border border-border-default rounded-lg text-sm text-text-primary focus:outline-hidden focus:border-brand-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default bg-bg-base">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg-muted transition-colors"
          >
            Cancel
          </button>
          {selectedTemplate && (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Insert Template</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
