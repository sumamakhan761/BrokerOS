// ============================================================================
// BrokerOS — WhatsApp Broadcasts Table
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Send,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { WhatsAppBroadcast } from '../../types';

interface WhatsAppBroadcastsTableProps {
  accountId?: string;
}

export const WhatsAppBroadcastsTable: React.FC<WhatsAppBroadcastsTableProps> = ({
  accountId,
}) => {
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<WhatsAppBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    async function fetchBroadcasts() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (accountId) query.set('accountId', accountId);

        const res = await fetch(`${baseUrl}/api/marketing/whatsapp/broadcasts?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBroadcasts(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching broadcasts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBroadcasts();
  }, [baseUrl, accountId]);

  const renderStatusBadge = (status: WhatsAppBroadcast['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'SENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Sending</span>
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Clock className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            <span>Draft</span>
          </span>
        );
    }
  };

  const filtered = broadcasts.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.templateName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search broadcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-base border border-border-default rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-brand-500 transition-colors"
          />
        </div>

        <Link
          href="/dashboard/marketing/whatsapp/broadcasts/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-2xs w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-bg-surface border border-border-default rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-subtle/80 text-text-secondary font-semibold uppercase tracking-wider text-[11px] border-b border-border-default">
              <tr>
                <th className="px-6 py-3.5">Campaign Name</th>
                <th className="px-6 py-3.5">Template</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Recipients</th>
                <th className="px-6 py-3.5">Funnel (Sent / Del / Read / Rep)</th>
                <th className="px-6 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-tertiary">
                    Loading broadcasts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-tertiary">
                    No broadcast campaigns found. Create your first campaign above.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => router.push(`/dashboard/marketing/whatsapp/broadcasts/${b.id}`)}
                    className="hover:bg-bg-subtle/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-text-primary text-xs hover:text-brand-600 transition-colors">
                        {b.name}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-mono text-text-secondary">
                      {b.templateName}
                    </td>

                    <td className="px-6 py-4">{renderStatusBadge(b.status)}</td>

                    <td className="px-6 py-4 font-semibold text-text-primary">
                      {b.totalRecipients.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-semibold text-emerald-500">{b.sentCount}</span>
                          <span className="text-text-tertiary">/</span>
                          <span className="font-semibold text-blue-500">{b.deliveredCount}</span>
                          <span className="text-text-tertiary">/</span>
                          <span className="font-semibold text-purple-500">{b.readCount}</span>
                          <span className="text-text-tertiary">/</span>
                          <span className="font-semibold text-amber-500">{b.repliedCount}</span>
                        </div>

                        {/* Visual Progress Bar */}
                        {b.totalRecipients > 0 && (
                          <div className="w-20 bg-bg-muted rounded-full h-1.5 overflow-hidden shrink-0 ml-2">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.round((b.sentCount / b.totalRecipients) * 100),
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-text-tertiary">
                      {new Date(b.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
