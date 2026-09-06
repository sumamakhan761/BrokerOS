'use client';

import React, { useMemo } from 'react';
import { Search, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export interface RecipientItem {
  id: string;
  phone: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'REPLIED' | 'FAILED';
  errorMessage?: string | null;
  templateParams?: any;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  contact?: {
    id: string;
    name?: string | null;
    phone: string;
  } | null;
}

export interface BroadcastRecipientsTableProps {
  recipients: RecipientItem[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BroadcastRecipientsTable({
  recipients,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
}: BroadcastRecipientsTableProps) {
  const filteredRecipients = useMemo(() => {
    if (!search.trim()) return recipients;
    const term = search.toLowerCase();
    return recipients.filter(
      (r) =>
        r.phone.includes(term) ||
        (r.contact?.name && r.contact.name.toLowerCase().includes(term)),
    );
  }, [recipients, search]);

  return (
    <div className="rounded-2xl border border-border-default bg-bg-surface overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-subtle/30">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors shrink-0',
                statusFilter === st
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-bg-surface text-text-muted hover:text-text-primary border border-border-default',
              )}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-text-muted absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search phone or name..."
            className="pl-8 text-xs bg-bg-surface h-8"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-bg-subtle text-text-secondary font-semibold uppercase tracking-wider text-[10px] border-b border-border-default">
            <tr>
              <th className="px-5 py-3">Recipient</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Parameters</th>
              <th className="px-5 py-3">Timeline</th>
              <th className="px-5 py-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {filteredRecipients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-text-muted">
                  No recipients matching current filter.
                </td>
              </tr>
            ) : (
              filteredRecipients.map((r) => (
                <tr key={r.id} className="hover:bg-bg-subtle/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-text-primary text-xs">{r.phone}</p>
                    {r.contact?.name && (
                      <p className="text-[11px] text-text-muted">{r.contact.name}</p>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <RecipientStatusBadge status={r.status} />
                  </td>

                  <td className="px-5 py-3.5 font-mono text-[11px]">
                    {Array.isArray(r.templateParams) && r.templateParams.length > 0 ? (
                      <span className="bg-bg-subtle px-1.5 py-0.5 rounded text-text-primary">
                        {r.templateParams.join(', ')}
                      </span>
                    ) : r.templateParams && typeof r.templateParams === 'object' && Object.keys(r.templateParams).length > 0 ? (
                      <span className="bg-bg-subtle px-1.5 py-0.5 rounded text-text-primary">
                        {JSON.stringify(r.templateParams)}
                      </span>
                    ) : (
                      <span className="text-text-muted text-[11px] italic">None (Static template)</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-[11px] text-text-muted">
                    {r.readAt ? (
                      <span className="text-blue-600 font-medium">Read: {new Date(r.readAt).toLocaleTimeString()}</span>
                    ) : r.deliveredAt ? (
                      <span className="text-emerald-600 font-medium">Delivered: {new Date(r.deliveredAt).toLocaleTimeString()}</span>
                    ) : r.sentAt ? (
                      <span>Sent: {new Date(r.sentAt).toLocaleTimeString()}</span>
                    ) : (
                      <span>Enqueued</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-right text-xs">
                    {r.errorMessage ? (
                      <span className="text-red-500 font-medium text-[11px]" title={r.errorMessage}>
                        {r.errorMessage.slice(0, 40)}...
                      </span>
                    ) : r.status === 'SENT' || r.status === 'DELIVERED' || r.status === 'READ' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-medium">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Accepted by Meta</span>
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 border-t border-border-default bg-bg-surface text-xs">
          <span className="text-text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="h-7 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className="h-7 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipientStatusBadge({ status }: { status: string }) {
  const classes =
    status === 'READ' || status === 'REPLIED'
      ? 'border-purple-500/30 bg-purple-50 text-purple-700'
      : status === 'DELIVERED'
      ? 'border-blue-500/30 bg-blue-50 text-blue-700'
      : status === 'SENT'
      ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
      : status === 'FAILED'
      ? 'border-red-500/30 bg-red-50 text-red-700'
      : 'border-zinc-500/30 bg-zinc-50 text-zinc-700';

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', classes)}>
      {status}
    </span>
  );
}
