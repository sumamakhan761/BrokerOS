'use client';

import React from 'react';

interface ContactDealsTabProps {
  deals?: any[];
}

export const ContactDealsTab: React.FC<ContactDealsTabProps> = ({ deals = [] }) => {
  return (
    <div className="space-y-3">
      {deals.length === 0 ? (
        <p className="text-center py-8 text-xs text-text-tertiary italic">
          No WhatsApp CRM deals associated with this contact yet.
        </p>
      ) : (
        deals.map((deal: any) => (
          <div
            key={deal.id}
            className="p-4 bg-bg-base border border-border-default rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <h5 className="font-semibold text-xs text-text-primary">{deal.title}</h5>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600">
                {deal.stage?.name || 'Stage'}
              </span>
            </div>
            <p className="text-xs font-bold text-emerald-600">
              {deal.currency || 'USD'} {Number(deal.value || 0).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};
