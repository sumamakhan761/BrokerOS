// ============================================================================
// BrokerOS — WhatsApp Deal Card Component
// ============================================================================

'use client';

import React from 'react';
import { Calendar, Check, X, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WhatsAppDealItem {
  id: string;
  pipelineId: string;
  stageId: string;
  contactId: string;
  title: string;
  value: number;
  currency: string;
  status: 'active' | 'won' | 'lost';
  notes?: string | null;
  expectedCloseDate?: string | null;
  assignedUserId?: string | null;
  contact?: {
    id: string;
    name?: string | null;
    phone: string;
    email?: string | null;
  } | null;
  assignedUser?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  stage?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface DealCardProps {
  deal: WhatsAppDealItem;
  stageColor?: string;
  onEdit: (deal: WhatsAppDealItem) => void;
  onDragStart?: (e: React.DragEvent, deal: WhatsAppDealItem) => void;
}

function formatInr(val: number) {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export function DealCard({ deal, stageColor, onEdit, onDragStart }: DealCardProps) {
  const contactName = deal.contact?.name || deal.contact?.phone || 'Unknown Contact';

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', deal.id);
        onDragStart?.(e, deal);
      }}
      onClick={() => onEdit(deal)}
      className="group relative w-full cursor-pointer rounded-xl border border-border-default bg-bg-surface pl-3.5 pr-3 py-3 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-sm select-none"
    >
      {/* Accent left color border */}
      <span
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
        style={{ backgroundColor: stageColor || '#3b82f6' }}
      />

      <div className="flex items-start justify-between gap-2">
        <h4 className="flex-1 text-xs font-bold leading-snug text-text-primary group-hover:text-brand-600 transition-colors line-clamp-2">
          {deal.title}
        </h4>

        {deal.status === 'won' && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            <Check className="h-3 w-3" />
            Won
          </span>
        )}
        {deal.status === 'lost' && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
            <X className="h-3 w-3" />
            Lost
          </span>
        )}
      </div>

      {/* Contact name & phone */}
      <div className="mt-2 flex items-center gap-1.5 text-text-muted">
        <User className="h-3 w-3 shrink-0" />
        <span className="text-[11px] font-medium truncate">{contactName}</span>
        {deal.contact?.phone && (
          <span className="text-[10px] text-text-muted/70 font-mono">({deal.contact.phone.slice(-4)})</span>
        )}
      </div>

      {/* Value & close date */}
      <div className="mt-2.5 flex items-center justify-between border-t border-border-default/50 pt-2 text-xs">
        <span className="font-bold text-brand-600">
          {formatInr(deal.value)}
        </span>

        {deal.expectedCloseDate && (
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <Calendar className="h-3 w-3" />
            {new Date(deal.expectedCloseDate).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {/* Assignee Avatar */}
      {deal.assignedUser && (
        <div className="mt-2 flex items-center justify-end">
          <span
            title={deal.assignedUser.name || deal.assignedUser.email}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/15 text-[10px] font-bold text-brand-600"
          >
            {(deal.assignedUser.name || deal.assignedUser.email || 'U')[0].toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
