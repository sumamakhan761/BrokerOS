// ============================================================================
// BrokerOS — WhatsApp Flow Runs History View
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FlowRunItem {
  id: string;
  flowId: string;
  status: 'active' | 'completed' | 'failed' | 'timed_out';
  currentNodeKey?: string | null;
  vars?: Record<string, any>;
  startedAt: string;
  endedAt?: string | null;
  endReason?: string | null;
  contact?: {
    id: string;
    name?: string | null;
    phone: string;
  } | null;
}

export function FlowRunsView({ id }: { id: string }) {
  const router = useRouter();
  const [flowName, setFlowName] = useState('Flow Bot');
  const [runs, setRuns] = useState<FlowRunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const [fRes, rRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/flows/${id}`, { credentials: 'include' }),
          fetch(`${baseUrl}/api/marketing/whatsapp/flows/${id}/runs`, { credentials: 'include' }),
        ]);

        if (fRes.ok) {
          const fData = await fRes.json();
          setFlowName(fData.name || 'Flow Bot');
        }

        if (rRes.ok) {
          const rData = await rRes.json();
          setRuns(Array.isArray(rData) ? rData : rData.items || []);
        } else {
          setError('Failed to load flow run history');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading run history');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-red-500 font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/marketing/whatsapp/flows/${id}`)}>
          Back to Flow
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/marketing/whatsapp/flows/${id}`)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{flowName}</h1>
          <p className="text-xs text-text-muted">Interactive Execution Logs & Captured Variables</p>
        </div>
      </div>

      {/* Runs List */}
      {runs.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-subtle/40 p-6 text-center">
          <Clock className="h-8 w-8 text-text-muted mb-2 opacity-50" />
          <p className="text-sm font-semibold text-text-primary">No Execution Runs Yet</p>
          <p className="mt-1 text-xs text-text-muted max-w-md">
            When a customer sends a message matching this bot's keywords, their interactive replies and variable responses will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {runs.map((run) => {
            const isOpen = expandedRunId === run.id;
            const varsCount = Object.keys(run.vars || {}).length;

            return (
              <div
                key={run.id}
                className="rounded-xl border border-border-default bg-bg-surface overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedRunId(isOpen ? null : run.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-subtle/50 transition-colors"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-text-muted shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
                  )}

                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      run.status === 'completed'
                        ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
                        : run.status === 'active'
                        ? 'border-blue-500/30 bg-blue-50 text-blue-700 animate-pulse'
                        : 'border-red-500/30 bg-red-50 text-red-700',
                    )}
                  >
                    {run.status}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-text-primary">
                      {run.contact?.name || run.contact?.phone || 'Lead'}
                    </div>
                    <div className="truncate text-[11px] text-text-muted mt-0.5">
                      Current Node: <span className="font-mono text-brand-600">{run.currentNodeKey || 'end'}</span> · {varsCount} variables collected
                    </div>
                  </div>

                  <div className="text-[11px] text-text-muted shrink-0">
                    {new Date(run.startedAt).toLocaleString()}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border-default bg-bg-subtle/40 px-4 py-3.5 space-y-3">
                    {run.endReason && (
                      <p className="text-xs text-text-muted">
                        <strong>Outcome / End Reason:</strong> {run.endReason}
                      </p>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                        <Database className="h-3.5 w-3.5" />
                        <span>Captured User Variables:</span>
                      </div>
                      {varsCount === 0 ? (
                        <p className="text-xs text-text-muted italic">No variables captured.</p>
                      ) : (
                        <pre className="rounded-lg bg-bg-surface border border-border-default p-3 text-xs font-mono text-text-primary overflow-x-auto">
                          {JSON.stringify(run.vars, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
