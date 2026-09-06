'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface StepResult {
  stepType?: string;
  step_type?: string;
  status: 'success' | 'failed';
  detail?: string;
}

interface AutomationLogItem {
  id: string;
  automationId: string;
  triggerEvent: string;
  status: 'success' | 'partial' | 'failed';
  stepsExecuted?: StepResult[];
  errorMessage?: string | null;
  createdAt: string;
  contact?: {
    id: string;
    name?: string | null;
    phone: string;
  } | null;
}

export function AutomationLogsView({ id }: { id: string }) {
  const router = useRouter();
  const [automationName, setAutomationName] = useState<string>('Automation');
  const [logs, setLogs] = useState<AutomationLogItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const [autoRes, logsRes] = await Promise.all([
          fetch(`${baseUrl}/api/marketing/whatsapp/automations/${id}`, { credentials: 'include' }),
          fetch(`${baseUrl}/api/marketing/whatsapp/automations/${id}/logs`, { credentials: 'include' }),
        ]);

        if (cancelled) return;

        if (autoRes.ok) {
          const autoData = await autoRes.json();
          setAutomationName(autoData.name || 'Automation');
        }

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(Array.isArray(logsData) ? logsData : logsData.items || []);
        } else {
          setError('Failed to load execution logs');
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'An error occurred');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
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
        <p className="text-sm text-red-500">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/marketing/whatsapp/automations')}
          className="text-xs"
        >
          Back to Automations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard/marketing/whatsapp/automations')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-text-muted hover:bg-bg-subtle hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">{automationName}</h1>
          <p className="text-xs text-text-muted">Workflow Run History & Audit Execution Traces</p>
        </div>
      </div>

      {/* Logs List */}
      {!logs || logs.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border-default bg-bg-subtle/40 p-6 text-center">
          <Clock className="h-8 w-8 text-text-muted mb-2 opacity-50" />
          <p className="text-sm font-semibold text-text-primary">No Execution Logs Yet</p>
          <p className="mt-1 text-xs text-text-muted max-w-md">
            When an inbound event triggers this automation, all step executions, delays, conditions, and external API responses will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => {
            const isOpen = openLogId === log.id;
            const steps = log.stepsExecuted || [];
            return (
              <div
                key={log.id}
                className="rounded-xl border border-border-default bg-bg-surface overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenLogId(isOpen ? null : log.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-subtle/50 transition-colors"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-text-muted shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-muted shrink-0" />
                  )}

                  <StatusBadge status={log.status} />

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold text-text-primary">
                      {log.contact?.name || log.contact?.phone || 'Anonymous / Unlinked Lead'}
                    </div>
                    <div className="truncate text-[11px] text-text-muted mt-0.5">
                      Trigger: <span className="font-mono">{log.triggerEvent}</span> · {steps.length} {steps.length === 1 ? 'step' : 'steps'} executed
                    </div>
                  </div>

                  <div className="text-[11px] text-text-muted shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border-default bg-bg-subtle/40 px-4 py-3.5">
                    {log.errorMessage && (
                      <div className="mb-3 rounded-lg border border-red-500/30 bg-red-50 p-2.5 text-xs text-red-700">
                        <strong>Error:</strong> {log.errorMessage}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        Execution Step Trace:
                      </p>
                      {steps.length === 0 ? (
                        <p className="text-xs text-text-muted italic">No steps recorded in this run.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {steps.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span
                                className={cn(
                                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                                  r.status === 'success'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-600',
                                )}
                              >
                                {r.status === 'success' ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                              </span>
                              <span className="font-medium text-text-primary">
                                {r.stepType || r.step_type}
                              </span>
                              {r.detail && (
                                <span className="text-text-muted truncate">— {r.detail}</span>
                              )}
                            </div>
                          ))}
                        </div>
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

function StatusBadge({ status }: { status: 'success' | 'partial' | 'failed' }) {
  const classes =
    status === 'success'
      ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
      : status === 'partial'
      ? 'border-amber-500/30 bg-amber-50 text-amber-700'
      : 'border-red-500/30 bg-red-50 text-red-700';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        classes,
      )}
    >
      {status}
    </span>
  );
}
