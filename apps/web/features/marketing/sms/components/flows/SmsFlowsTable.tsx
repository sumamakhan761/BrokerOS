// ============================================================================
// BrokerOS — SMS Interactive Flows Table & Management
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Workflow,
  Plus,
  Search,
  Layers,
  Edit2,
  Trash2,
  Copy,
  ArrowRight,
  Loader2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function SmsFlowsTable() {
  const router = useRouter();
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const loadFlows = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/flows`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setFlows(data.items || []);
      } else {
        toast.error('Failed to load SMS flows');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading flows');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const handleCreateBlankFlow = async () => {
    try {
      setCreating(true);
      const res = await fetch(`${baseUrl}/api/marketing/sms/flows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Untitled SMS Flow',
          description: 'Keyword trigger and autoresponder sequence',
          triggerType: 'keyword_match',
          triggerConfig: { keywords: ['visit', 'price'], matchType: 'contains' },
          isGlobal: true,
          nodes: [
            {
              nodeKey: 'reply_1',
              nodeType: 'send_sms',
              config: {
                text: 'Hi {{firstName}}, thank you for reaching out! Would you like a brochure or price sheet sent over?',
              },
              positionX: 100,
              positionY: 100,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to create flow');
      const data = await res.json();
      toast.success('Created new SMS flow!');
      router.push(`/dashboard/marketing/sms/flows/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create SMS flow');
    } finally {
      setCreating(false);
    }
  };

  const handleCloneFlow = async (id: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/marketing/sms/flows/${id}/duplicate`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Clone failed');
      toast.success('Flow duplicated successfully!');
      loadFlows();
    } catch (err: any) {
      toast.error(err.message || 'Failed to clone flow');
    }
  };

  const handleDeleteFlow = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this SMS flow?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${baseUrl}/api/marketing/sms/flows/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Flow deleted');
      setFlows(flows.filter((f) => f.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete flow');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = flows.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-4">
      {/* ── Header Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SMS flows by name or description..."
            className="pl-9 bg-white border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateBlankFlow}
            disabled={creating}
            className="gap-1.5 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 px-4"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Create New Flow</span>
          </Button>
        </div>
      </div>

      {/* ── Flows Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/90 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Flow Name & Trigger</th>
                <th className="py-3.5 px-4">Trigger Type</th>
                <th className="py-3.5 px-4">Scope</th>
                <th className="py-3.5 px-4 text-center">Action Steps</th>
                <th className="py-3.5 px-4 text-center">Executed Runs</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold">
                      <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
                      <span>Loading SMS flows...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-2.5">
                      <Workflow className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">No automated SMS flows found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Create your first automated flow to auto-respond to prospective buyers via carrier SMS.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((fl) => (
                  <tr key={fl.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 max-w-[280px]">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 mt-0.5 shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/dashboard/marketing/sms/flows/${fl.id}`}
                            className="font-extrabold text-xs text-slate-900 hover:text-amber-600 transition-colors line-clamp-1"
                          >
                            {fl.name}
                          </Link>
                          {fl.description && (
                            <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-0.5">
                              {fl.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {fl.triggerType === 'keyword_match'
                          ? 'Keyword Match'
                          : fl.triggerType === 'any_reply'
                          ? 'Any Inbound Reply'
                          : 'Broadcast Scoped'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[11px] font-medium text-slate-600">
                        {fl.isGlobal ? 'Global (All)' : fl.projectName || 'Project Scoped'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {fl.nodesCount || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-mono font-bold text-xs text-slate-600 tabular-nums">
                        {fl.runsCount || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                          fl.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {fl.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/marketing/sms/flows/${fl.id}`)}
                          className="h-7 px-2.5 text-[11px] font-bold gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCloneFlow(fl.id)}
                          title="Duplicate Flow"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-900"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingId === fl.id}
                          onClick={() => handleDeleteFlow(fl.id)}
                          title="Delete Flow"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
}
