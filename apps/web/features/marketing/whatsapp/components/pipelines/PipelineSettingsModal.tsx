// ============================================================================
// BrokerOS — WhatsApp Pipeline Settings Modal
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { PipelineStageItem } from './PipelineBoard';

const STAGE_COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#10b981',
  '#14b8a6',
  '#6b7280',
];

interface PipelineSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: { id: string; name: string };
  stages: PipelineStageItem[];
  onSaved: () => void;
  onDeleted?: () => void;
}

export function PipelineSettingsModal({
  open,
  onOpenChange,
  pipeline,
  stages,
  onSaved,
  onDeleted,
}: PipelineSettingsModalProps) {
  const [name, setName] = useState(pipeline.name);
  const [localStages, setLocalStages] = useState<PipelineStageItem[]>(stages);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState(STAGE_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(pipeline.name);
    setLocalStages([...stages].sort((a, b) => a.position - b.position));
    setConfirmDelete(false);
  }, [open, pipeline, stages]);

  if (!open) return null;

  function moveStage(idx: number, direction: -1 | 1) {
    const target = idx + direction;
    if (target < 0 || target >= localStages.length) return;
    const copy = [...localStages];
    const temp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = temp;
    // update positions
    setLocalStages(copy.map((s, i) => ({ ...s, position: i })));
  }

  function addStage() {
    if (!newStageName.trim()) return;
    const newStage: PipelineStageItem = {
      id: '',
      name: newStageName.trim(),
      position: localStages.length,
      color: newStageColor,
    };
    setLocalStages([...localStages, newStage]);
    setNewStageName('');
  }

  function removeStage(idx: number) {
    if (localStages.length <= 1) {
      toast.error('Pipeline must have at least one stage');
      return;
    }
    setLocalStages(
      localStages.filter((_, i) => i !== idx).map((s, i) => ({ ...s, position: i })),
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Pipeline name cannot be empty');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/pipelines/${pipeline.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          stages: localStages.map((s, i) => ({
            id: s.id || undefined,
            name: s.name.trim(),
            position: i,
            color: s.color,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to update pipeline');
      toast.success('Pipeline stages updated');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Error updating pipeline');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePipeline() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/api/marketing/whatsapp/pipelines/${pipeline.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete pipeline');
      toast.success('Pipeline deleted');
      onDeleted?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || 'Error deleting pipeline');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-default bg-bg-surface p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-brand-600" />
            <h3 className="text-base font-bold text-text-primary">Pipeline & Stage Settings</h3>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Pipeline Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-primary block">Pipeline Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs bg-bg-subtle"
          />
        </div>

        {/* Stages List */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-primary block">
            Stages Configuration ({localStages.length})
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {localStages.map((s, idx) => (
              <div
                key={s.id || idx}
                className="flex items-center gap-2 rounded-xl border border-border-default bg-bg-subtle/50 p-2.5"
              >
                <div
                  className="h-4 w-4 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <Input
                  value={s.name}
                  onChange={(e) => {
                    const copy = [...localStages];
                    copy[idx] = { ...s, name: e.target.value };
                    setLocalStages(copy);
                  }}
                  className="text-xs bg-bg-surface flex-1 h-8"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveStage(idx, -1)}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === localStages.length - 1}
                    onClick={() => moveStage(idx, 1)}
                    className="p-1 text-text-muted hover:text-text-primary disabled:opacity-20"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStage(idx)}
                    className="p-1 text-red-500 hover:text-red-600 rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Stage row */}
        <div className="rounded-xl border border-dashed border-border-default bg-bg-subtle p-3 space-y-2">
          <span className="text-[11px] font-bold text-text-muted block">Add New Stage:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {STAGE_COLORS.slice(0, 5).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewStageColor(c)}
                  className={cn(
                    'h-5 w-5 rounded-full transition-transform',
                    newStageColor === c && 'ring-2 ring-brand-600 scale-110',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Input
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Stage name (e.g. Agreement Signed)"
              className="text-xs bg-bg-surface flex-1 h-8"
            />
            <Button
              type="button"
              size="sm"
              onClick={addStage}
              disabled={!newStageName.trim()}
              className="h-8 text-xs bg-brand-600 text-white hover:bg-brand-700"
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border-default pt-4">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeletePipeline}
                disabled={saving}
                className="text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Delete Pipeline
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-600 border-red-500/30 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Pipeline
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-600 text-white hover:bg-brand-700 text-xs font-semibold px-4"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
