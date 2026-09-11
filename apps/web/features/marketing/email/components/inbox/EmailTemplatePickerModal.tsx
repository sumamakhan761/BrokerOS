// ============================================================================
// BrokerOS — Email Template Picker Modal
// ============================================================================

import React, { useState } from 'react';
import { Search, X, FileText, Check } from 'lucide-react';

interface EmailTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateContent: string, subject?: string) => void;
}

export const EmailTemplatePickerModal: React.FC<EmailTemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [search, setSearch] = useState('');

  const builtInTemplates = [
    {
      id: 'tmpl-1',
      name: 'Executive Site Visit Invitation',
      category: 'Inquiries',
      subject: 'Private VIP Site Tour & Architect Presentation',
      content:
        'Thank you for your inquiry. We would be pleased to coordinate a private site inspection of the luxury penthouses and show residences this week. Refreshments and a 1-on-1 architect briefing will be provided. Please let us know your preferred morning or afternoon window.',
    },
    {
      id: 'tmpl-2',
      name: 'Project Price Sheet & Milestone Schedule',
      category: 'Pricing',
      subject: 'Detailed Pricing Breakdown & Developer Milestone Terms',
      content:
        'Per your request, here is the official developer payment schedule breakdown. We have locked in exclusive launch incentives including 0% registration waiver and staggered 20/80 milestones. Our portfolio advisors are ready to walk you through unit allocations.',
    },
    {
      id: 'tmpl-3',
      name: 'ROI & Rental Yield Briefing',
      category: 'Investor',
      subject: 'Projected Capital Appreciation & Net Rental Yield Report',
      content:
        'Thank you for considering our project for your portfolio. Based on regional analytics and prime infrastructure expansion, this master community is projecting 9.2% gross rental yields and conservative 18% capital appreciation over the construction cycle. Attached is our investor deck.',
    },
    {
      id: 'tmpl-4',
      name: 'Exclusive Unit Hold Confirmation',
      category: 'Booking',
      subject: 'Priority Unit Reservation Confirmation',
      content:
        'We have placed a temporary 48-hour priority hold on your selected residence. To finalize the expression of interest and lock in the pre-launch pricing tier, kindly confirm with your assigned wealth advisor.',
    },
  ];

  if (!isOpen) return null;

  const filtered = builtInTemplates.filter(
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
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">Select Email Template</h3>
              <p className="text-xs text-text-tertiary">Insert curated real-estate reply templates</p>
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
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary focus:outline-hidden focus:border-brand-500"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl.content, tmpl.subject);
                onClose();
              }}
              className="p-4 bg-bg-base hover:bg-bg-subtle border border-border-default hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary group-hover:text-emerald-600 transition-colors">
                    {tmpl.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-surface border border-border-default text-text-tertiary font-medium">
                    {tmpl.category}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Insert Template ↵
                </span>
              </div>
              <p className="text-[11px] font-medium text-text-tertiary">Subject: {tmpl.subject}</p>
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{tmpl.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
