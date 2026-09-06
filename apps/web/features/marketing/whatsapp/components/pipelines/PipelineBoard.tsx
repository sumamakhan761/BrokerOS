// ============================================================================
// BrokerOS — WhatsApp Pipeline Kanban Board
// ============================================================================

'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { DealCard, type WhatsAppDealItem } from './DealCard';

export interface PipelineStageItem {
  id: string;
  name: string;
  position: number;
  color: string;
  _count?: { deals: number };
}

interface PipelineBoardProps {
  stages: PipelineStageItem[];
  deals: WhatsAppDealItem[];
  onDealMoved: (dealId: string, targetStageId: string) => void;
  onAddDeal: (stageId: string) => void;
  onEditDeal: (deal: WhatsAppDealItem) => void;
}

function formatInr(val: number) {
  if (!val) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export function PipelineBoard({
  stages,
  deals,
  onDealMoved,
  onAddDeal,
  onEditDeal,
}: PipelineBoardProps) {
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const sortedStages = [...stages].sort((a, b) => a.position - b.position);

  const dealsByStage = new Map<string, WhatsAppDealItem[]>();
  for (const s of sortedStages) dealsByStage.set(s.id, []);
  for (const d of deals) {
    const list = dealsByStage.get(d.stageId) || [];
    list.push(d);
    dealsByStage.set(d.stageId, list);
  }

  function handleDrop(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    setDragOverStageId(null);
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;
    onDealMoved(dealId, stageId);
  }

  function handleDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
      {sortedStages.map((stage) => {
        const stageDeals = dealsByStage.get(stage.id) || [];
        const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
        const isHovered = dragOverStageId === stage.id;

        return (
          <div
            key={stage.id}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={() => setDragOverStageId(null)}
            onDrop={(e) => handleDrop(e, stage.id)}
            className={cn(
              'flex flex-col w-72 shrink-0 rounded-2xl border bg-bg-subtle/50 transition-all overflow-hidden',
              isHovered
                ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/20'
                : 'border-border-default',
            )}
          >
            {/* Stage Column Header */}
            <div className="p-3.5 border-b border-border-default bg-bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color || '#3b82f6' }}
                />
                <h3 className="text-xs font-bold text-text-primary truncate">
                  {stage.name}
                </h3>
                <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-[10px] font-bold text-text-muted">
                  {stageDeals.length}
                </span>
              </div>

              <span className="text-[11px] font-bold text-text-muted shrink-0">
                {formatInr(totalValue)}
              </span>
            </div>

            {/* Deals List */}
            <div className="p-3 flex-1 flex flex-col gap-2.5 min-h-[400px] overflow-y-auto max-h-[calc(100vh-280px)]">
              {stageDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  stageColor={stage.color}
                  onEdit={onEditDeal}
                />
              ))}

              {stageDeals.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default/80 p-4 text-center">
                  <p className="text-[11px] text-text-muted italic">No deals in this stage</p>
                </div>
              )}

              {/* Add Deal Button in Column */}
              <button
                type="button"
                onClick={() => onAddDeal(stage.id)}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-default py-2 text-xs font-semibold text-text-muted hover:border-brand-600 hover:text-brand-600 hover:bg-bg-surface transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Deal</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
