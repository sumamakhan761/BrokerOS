'use client';

import React, { use, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Users,
  Send,
  CheckCheck,
  Eye,
  AlertCircle,
  MessageCircle,
  Download,
  Trash2,
  PlayCircle,
  RotateCcw,
  StopCircle,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { WhatsAppBroadcast } from '@/features/marketing/whatsapp/types';

interface RecipientItem {
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

export default function BroadcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [broadcast, setBroadcast] = useState<WhatsAppBroadcast | null>(null);
  const [recipients, setRecipients] = useState<RecipientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [bRes, rRes] = await Promise.all([
        fetch(`/api/marketing/whatsapp/broadcasts/${id}`),
        fetch(
          `/api/marketing/whatsapp/broadcasts/${id}/recipients?page=${page}&limit=50${
            statusFilter !== 'ALL' ? `&status=${statusFilter}` : ''
          }`,
        ),
      ]);

      if (!bRes.ok) throw new Error('Broadcast not found');
      const bData = await bRes.json();
      setBroadcast(bData);

      if (rRes.ok) {
        const rData = await rRes.json();
        setRecipients(rData.items || []);
        setTotalPages(rData.pagination?.pages || 1);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading broadcast');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id, page, statusFilter]);

  // Polling for live status when SENDING
  useEffect(() => {
    if (broadcast?.status !== 'SENDING') return;
    const timer = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(timer);
  }, [broadcast?.status, id, page, statusFilter]);

  async function handleDispatchNow() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/marketing/whatsapp/broadcasts/${id}/dispatch`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Broadcast dispatch triggered');
        loadData();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || 'Failed to dispatch broadcast');
      }
    } catch {
      toast.error('Error triggering broadcast');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/marketing/whatsapp/broadcasts/${id}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Broadcast cancelled');
        loadData();
      } else {
        toast.error('Failed to cancel broadcast');
      }
    } catch {
      toast.error('Error cancelling broadcast');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/marketing/whatsapp/broadcasts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Broadcast deleted');
        router.push('/dashboard/marketing/whatsapp/broadcasts');
      } else {
        toast.error('Failed to delete broadcast');
      }
    } catch {
      toast.error('Error deleting broadcast');
    } finally {
      setActionLoading(false);
    }
  }

  function handleExportCsv() {
    if (recipients.length === 0) {
      toast.error('No recipients to export');
      return;
    }
    const headers = ['Phone', 'Contact Name', 'Status', 'Error', 'Sent At', 'Delivered At', 'Read At'];
    const rows = recipients.map((r) => [
      r.phone,
      r.contact?.name || '',
      r.status,
      r.errorMessage || '',
      r.sentAt || '',
      r.deliveredAt || '',
      r.readAt || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `broadcast_${broadcast?.name || id}_recipients.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  }

  const filteredRecipients = useMemo(() => {
    if (!search.trim()) return recipients;
    const term = search.toLowerCase();
    return recipients.filter(
      (r) =>
        r.phone.includes(term) ||
        (r.contact?.name && r.contact.name.toLowerCase().includes(term)),
    );
  }, [recipients, search]);

  if (loading && !broadcast) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-500 font-medium">{error || 'Broadcast not found'}</p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/marketing/whatsapp/broadcasts')}
          className="text-xs"
        >
          Back to Broadcasts
        </Button>
      </div>
    );
  }

  const total = broadcast.totalRecipients || 1;
  const sentPct = Math.round(((broadcast.sentCount || 0) / total) * 100);
  const delivPct = Math.round(((broadcast.deliveredCount || 0) / (broadcast.sentCount || 1)) * 100);
  const readPct = Math.round(((broadcast.readCount || 0) / (broadcast.deliveredCount || 1)) * 100);
  const repPct = Math.round(((broadcast.repliedCount || 0) / (broadcast.readCount || 1)) * 100);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/marketing/whatsapp/broadcasts')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">{broadcast.name}</h1>
              <span className="rounded-lg bg-bg-subtle px-2 py-0.5 font-mono text-[11px] text-text-secondary border border-border-default">
                {broadcast.templateName} ({broadcast.templateLanguage || 'en_US'})
              </span>
              <BroadcastStatusBadge status={broadcast.status} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Created {new Date(broadcast.createdAt).toLocaleString()}
              {broadcast.scheduledAt && ` · Scheduled for ${new Date(broadcast.scheduledAt).toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(broadcast.status === 'DRAFT' || broadcast.status === 'SCHEDULED') && (
            <Button
              size="sm"
              onClick={handleDispatchNow}
              disabled={actionLoading}
              className="bg-brand-600 text-white hover:bg-brand-700 text-xs h-8"
            >
              <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
              Dispatch Now
            </Button>
          )}

          {(broadcast.status === 'SCHEDULED' || broadcast.status === 'SENDING') && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={actionLoading}
              className="text-xs h-8 text-amber-600 border-amber-500/30 hover:bg-amber-50"
            >
              <StopCircle className="mr-1.5 h-3.5 w-3.5" />
              Cancel Broadcast
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="text-xs h-8"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={actionLoading}
            className="text-xs h-8 text-red-600 border-red-500/30 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Audience"
          value={broadcast.totalRecipients || 0}
          pct={100}
          icon={<Users className="h-4 w-4" />}
          color="bg-slate-500/10 text-slate-600"
        />
        <StatCard
          label="Sent Messages"
          value={broadcast.sentCount || 0}
          pct={sentPct}
          icon={<Send className="h-4 w-4" />}
          color="bg-brand-500/10 text-brand-600"
        />
        <StatCard
          label="Delivered"
          value={broadcast.deliveredCount || 0}
          pct={delivPct}
          icon={<CheckCheck className="h-4 w-4" />}
          color="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="Read / Seen"
          value={broadcast.readCount || 0}
          pct={readPct}
          icon={<Eye className="h-4 w-4" />}
          color="bg-purple-500/10 text-purple-600"
        />
        <StatCard
          label="Replied"
          value={broadcast.repliedCount || 0}
          pct={repPct}
          icon={<MessageCircle className="h-4 w-4" />}
          color="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="Failed / Bounced"
          value={broadcast.failedCount || 0}
          pct={Math.round(((broadcast.failedCount || 0) / total) * 100)}
          icon={<AlertCircle className="h-4 w-4" />}
          color="bg-red-500/10 text-red-600"
        />
      </div>

      {/* Delivery Funnel Progress Bar */}
      <div className="rounded-2xl border border-border-default bg-bg-surface p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Message Conversion Funnel
          </h3>
          <span className="text-xs font-semibold text-text-muted">
            {broadcast.sentCount || 0} of {broadcast.totalRecipients || 0} sent ({sentPct}%)
          </span>
        </div>
        <div className="space-y-2">
          <FunnelBar label="Sent" count={broadcast.sentCount || 0} max={total} color="bg-brand-600" />
          <FunnelBar label="Delivered" count={broadcast.deliveredCount || 0} max={total} color="bg-blue-600" />
          <FunnelBar label="Read" count={broadcast.readCount || 0} max={total} color="bg-purple-600" />
          <FunnelBar label="Replied" count={broadcast.repliedCount || 0} max={total} color="bg-emerald-600" />
        </div>
      </div>

      {/* Recipients Activity Table */}
      <div className="rounded-2xl border border-border-default bg-bg-surface overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-subtle/30">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
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
              onChange={(e) => setSearch(e.target.value)}
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  pct,
  icon,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', color)}>
          {icon}
        </div>
        <span className="text-[11px] font-semibold text-text-muted">{pct}%</span>
      </div>
      <p className="mt-2.5 text-xl font-bold text-text-primary">{value.toLocaleString()}</p>
      <p className="text-[11px] text-text-muted">{label}</p>
    </div>
  );
}

function FunnelBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(2, Math.round((count / Math.max(max, 1)) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-text-secondary">{label}</span>
      <div className="relative h-6 flex-1 rounded-full bg-bg-subtle overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute inset-0 flex items-center px-3 text-[11px] font-bold text-text-primary">
          {count.toLocaleString()} ({pct}%)
        </span>
      </div>
    </div>
  );
}

function BroadcastStatusBadge({ status }: { status: string }) {
  const classes =
    status === 'COMPLETED'
      ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
      : status === 'SENDING'
      ? 'border-blue-500/30 bg-blue-50 text-blue-700 animate-pulse'
      : status === 'SCHEDULED'
      ? 'border-purple-500/30 bg-purple-50 text-purple-700'
      : status === 'FAILED'
      ? 'border-red-500/30 bg-red-50 text-red-700'
      : 'border-zinc-500/30 bg-zinc-50 text-zinc-700';

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', classes)}>
      {status}
    </span>
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
