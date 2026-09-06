'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
  PlayCircle,
  StopCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { WhatsAppBroadcast } from '@/features/marketing/whatsapp/types';
import {
  BroadcastMetricsGrid,
} from '@/features/marketing/whatsapp/components/broadcasts/detail/BroadcastMetricsGrid';
import {
  BroadcastConversionFunnel,
} from '@/features/marketing/whatsapp/components/broadcasts/detail/BroadcastConversionFunnel';
import {
  BroadcastRecipientsTable,
  type RecipientItem,
} from '@/features/marketing/whatsapp/components/broadcasts/detail/BroadcastRecipientsTable';

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
      <BroadcastMetricsGrid broadcast={broadcast} />

      {/* Delivery Funnel Progress Bar */}
      <BroadcastConversionFunnel broadcast={broadcast} />

      {/* Recipients Activity Table */}
      <BroadcastRecipientsTable
        recipients={recipients}
        statusFilter={statusFilter}
        onStatusFilterChange={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        search={search}
        onSearchChange={setSearch}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
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
