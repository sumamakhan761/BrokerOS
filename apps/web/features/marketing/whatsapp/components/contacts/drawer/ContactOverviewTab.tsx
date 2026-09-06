'use client';

import React from 'react';
import { Mail, Building2, Tag as TagIcon, Link2 } from 'lucide-react';

interface ContactOverviewTabProps {
  contact: any;
}

export const ContactOverviewTab: React.FC<ContactOverviewTabProps> = ({ contact }) => {
  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-bg-base rounded-xl border border-border-default space-y-1">
          <span className="text-[11px] text-text-tertiary flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> Email
          </span>
          <p className="font-medium text-text-primary">
            {contact?.email || 'No email provided'}
          </p>
        </div>

        <div className="p-3 bg-bg-base rounded-xl border border-border-default space-y-1">
          <span className="text-[11px] text-text-tertiary flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> Organization
          </span>
          <p className="font-medium text-text-primary">
            {contact?.company || 'None'}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <TagIcon className="w-3.5 h-3.5 text-text-tertiary" />
          <span>Contact Tags</span>
        </h4>
        {contact?.tags && contact.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((t: any) => (
              <span
                key={t.tagId || t.id}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-600 border border-brand-500/20"
              >
                {t.tag?.name || 'Tag'}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-tertiary italic">No tags attached</p>
        )}
      </div>

      {/* Linked CRM Lead */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-text-tertiary" />
          <span>Linked Real Estate Lead</span>
        </h4>
        {contact?.lead ? (
          <div className="p-4 bg-bg-base rounded-xl border border-border-default space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-text-primary">
                {contact.lead.name || 'CRM Lead'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase">
                {contact.lead.status || 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Temperature: <strong className="text-text-secondary">{contact.lead.temperature || 'WARM'}</strong>
            </p>
          </div>
        ) : (
          <p className="text-xs text-text-tertiary italic">
            Not linked to a CRM lead record.
          </p>
        )}
      </div>
    </div>
  );
};
