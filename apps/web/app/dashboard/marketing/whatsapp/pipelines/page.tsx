'use client';

// ============================================================================
// BrokerOS — WhatsApp Sales Pipelines & Deals Kanban Page
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  Plus,
  Settings,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { DashboardPageWrapper } from '@/components/dashboard/DashboardPageWrapper';
import {
  PipelineBoard,
  type PipelineStageItem,
} from '@/features/marketing/whatsapp/components/pipelines/PipelineBoard';
import {
  DealCard,
  type WhatsAppDealItem,
} from '@/features/marketing/whatsapp/components/pipelines/DealCard';
import { DealFormModal } from '@/features/marketing/whatsapp/components/pipelines/DealFormModal';
import { PipelineSettingsModal } from '@/features/marketing/whatsapp/components/pipelines/PipelineSettingsModal';
import { PipelineAnalytics } from '@/features/marketing/whatsapp/components/pipelines/PipelineAnalytics';

interface PipelineRecord {
  id: string;
  name: string;
  isDefault: boolean;
  stages: PipelineStageItem[];
}

export default function WhatsAppPipelinesPage() {
  const [pipelines, setPipelines] = useState<PipelineRecord[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [deals, setDeals] = useState<WhatsAppDealItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<WhatsAppDealItem | null>(null);
  const [defaultStageId, setDefaultStageId] = useState<string>('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const activePipeline = pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  const loadPipelines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/pipelines`);
      if (res.ok) {
        const data = await res.json();
        const list: PipelineRecord[] = data.pipelines || [];
        setPipelines(list);
        if (list.length > 0 && !selectedPipelineId) {
          setSelectedPipelineId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pipelines:', err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, selectedPipelineId]);

  const loadDeals = useCallback(async (pipelineId: string) => {
    if (!pipelineId) return;
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/pipelines/${pipelineId}/deals`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  }, [baseUrl]);

  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  useEffect(() => {
    if (activePipeline?.id) {
      loadDeals(activePipeline.id);
    }
  }, [activePipeline?.id, loadDeals]);

  // Handle drag-and-drop or move to new stage
  const handleDealMoved = async (dealId: string, targetStageId: string) => {
    const targetDeal = deals.find((d) => d.id === dealId);
    if (!targetDeal || targetDeal.stageId === targetStageId) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stageId: targetStageId } : d)),
    );

    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: targetStageId }),
      });

      if (!res.ok) throw new Error('Failed to move deal');
      toast.success('Deal stage updated');
    } catch {
      toast.error('Failed to update stage on server');
      if (activePipeline?.id) loadDeals(activePipeline.id);
    }
  };

  const handleOpenAddDeal = (stageId?: string) => {
    setEditingDeal(null);
    setDefaultStageId(stageId || activePipeline?.stages[0]?.id || '');
    setDealFormOpen(true);
  };

  const handleOpenEditDeal = (deal: WhatsAppDealItem) => {
    setEditingDeal(deal);
    setDealFormOpen(true);
  };

  return (
    <DashboardPageWrapper
      loading={false}
      title="WhatsApp Sales Pipelines & Deals"
      subtitle="Visual Kanban deal tracker connected directly to WhatsApp leads, conversations, and site visits."
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-surface p-4 rounded-2xl border border-border-default shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
              <GitBranch className="h-4 w-4" />
            </div>

            {/* Pipeline Selector Dropdown */}
            {pipelines.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm font-bold text-text-primary hover:text-brand-600 transition-colors"
                  >
                    <span>{activePipeline?.name || 'Select Pipeline'}</span>
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-1.5">
                  {pipelines.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setSelectedPipelineId(p.id)}
                      className="text-xs font-semibold px-2.5 py-2 cursor-pointer rounded-lg hover:bg-bg-subtle"
                    >
                      {p.name} {p.isDefault && '(Default)'}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activePipeline && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                className="text-xs h-8 border-border-default hover:bg-bg-subtle"
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Pipeline Settings
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => handleOpenAddDeal()}
              className="text-xs h-8 bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Deal
            </Button>
          </div>
        </div>

        {/* Analytics Summary */}
        {activePipeline && (
          <PipelineAnalytics
            stages={activePipeline.stages || []}
            deals={deals}
          />
        )}

        {/* Kanban Board */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : activePipeline ? (
          <PipelineBoard
            stages={activePipeline.stages || []}
            deals={deals}
            onDealMoved={handleDealMoved}
            onAddDeal={handleOpenAddDeal}
            onEditDeal={handleOpenEditDeal}
          />
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border-default bg-bg-surface text-xs text-text-muted">
            No pipeline available. Refresh to auto-seed default sales pipeline.
          </div>
        )}

        {/* Deal Form Sheet / Modal */}
        {activePipeline && (
          <DealFormModal
            open={dealFormOpen}
            onOpenChange={setDealFormOpen}
            deal={editingDeal}
            pipelineId={activePipeline.id}
            stages={activePipeline.stages || []}
            defaultStageId={defaultStageId}
            onSaved={() => loadDeals(activePipeline.id)}
          />
        )}

        {/* Pipeline Settings Modal */}
        {activePipeline && (
          <PipelineSettingsModal
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            pipeline={activePipeline}
            stages={activePipeline.stages || []}
            onSaved={() => loadPipelines()}
            onDeleted={() => {
              setSelectedPipelineId('');
              loadPipelines();
            }}
          />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
