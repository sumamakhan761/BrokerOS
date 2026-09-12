// ============================================================================
// BrokerOS — SMS Flow Runs History View (WhatsApp & Email Parity)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SmsFlowRunItem {
  id: string;
  flowId: string;
  status: 'active' | 'completed' | 'failed';
  currentNodeKey?: string | null;
  inboundPhone?: string | null;
  inboundBody?: string | null;
  outboundReply?: string | null;
  vars?: Record<string, any> | null;
  startedAt: string;
  endedAt?: string | null;
  recipientId?: string | null;
  leadId?: string | null;
}

export function SmsFlowRunsView({ id }: { id: string }) {
  const router = useRouter();
  const [flowName, setFlowName] = useState('SMS Flow');
  const [runs, setRuns] = useState<SmsFlowRunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const [fRes, rRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/sms/flows/${id}`, { credentials: 'include' }),
          fetch(`${baseUrl}/api/marketing/sms/flows/${id}/runs`, { credentials: 'include' }),
        ]);

        if (fRes.ok) {
          const fData = await fRes.json();
          setFlowName(fData.name || 'SMS Flow');
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
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/marketing/sms/flows/${id}`)}>
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
          onClick={() => router.push(`/dashboard/marketing/sms/flows/${id}`)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{flowName}</h1>
          <p className="text-xs text-text-muted">Inbound SMS Reply Triggers & Automated Execution Logs</p>
        </div>
      </div>

      {/* Runs List */}
      {runs.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-subtle/40 p-6 text-center">
          <Clock className="h-8 w-8 text-text-muted mb-2 opacity-50" />
          <p className="text-sm font-semibold text-text-primary">No Execution Runs Yet</p>
          <p className="mt-1 text-xs text-text-muted max-w-md">
            When a prospect replies to a broadcast SMS matching this flow, their inbound carrier message and automated execution logs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {runs.map((run) => {
            const isOpen = expandedRunId === run.id;

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
                        ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : run.status === 'active'
                        ? 'border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
                    )}
                  >
                    {run.status}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {run.inboundPhone || 'Inbound Carrier Reply'}
                    </p>
                    <p className="text-[11px] text-text-muted truncate">
                      {run.inboundBody || 'No preview available'}
                    </p>
                  </div>

                  <span className="text-[11px] text-text-muted whitespace-nowrap">
                    {new Date(run.startedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border-default bg-bg-subtle/40 p-4 space-y-3 text-xs">
                    {/* Inbound content */}
                    <div>
                      <span className="font-bold text-text-secondary uppercase text-[10px] tracking-wider block mb-1">
                        Inbound SMS Message:
                      </span>
                      <div className="p-3 rounded-lg bg-bg-surface border border-border-default text-text-primary font-mono text-[11px] whitespace-pre-wrap">
                        {run.inboundBody || 'Empty'}
                      </div>
                    </div>

                    {/* Outbound reply content if generated */}
                    {run.outboundReply && (
                      <div>
                        <span className="font-bold text-brand-600 uppercase text-[10px] tracking-wider block mb-1 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" />
                          <span>Generated Outbound Automation Reply:</span>
                        </span>
                        <div className="p-3 rounded-lg bg-brand-500/5 border border-brand-500/20 text-text-primary text-[11px] whitespace-pre-wrap">
                          {run.outboundReply}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
                      <span>Run ID: {run.id}</span>
                      {run.endedAt && (
                        <span>
                          Completed in{' '}
                          {Math.round(
                            (new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) / 1000,
                          )}
                          s
                        </span>
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
