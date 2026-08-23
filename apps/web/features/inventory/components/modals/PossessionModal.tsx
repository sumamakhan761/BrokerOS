import React, { useState } from 'react';
import { X, Activity, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export type ConstructionStatus = 
  | 'NOT_STARTED'
  | 'EXCAVATION'
  | 'FOUNDATION'
  | 'SUPER_STRUCTURE'
  | 'BRICKWORK'
  | 'PLASTERING'
  | 'FINISHING'
  | 'READY_FOR_POSSESSION'
  | 'HANDOVER';

const statusLabels: Record<ConstructionStatus, string> = {
  NOT_STARTED: 'Not Started',
  EXCAVATION: 'Excavation',
  FOUNDATION: 'Foundation',
  SUPER_STRUCTURE: 'Super Structure',
  BRICKWORK: 'Brickwork',
  PLASTERING: 'Plastering',
  FINISHING: 'Finishing',
  READY_FOR_POSSESSION: 'Ready for Possession',
  HANDOVER: 'Handover'
};

interface PossessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'project' | 'tower' | 'unit';
  entityName: string;
  initialStatus?: ConstructionStatus;
  initialTimeline?: { value: number; unit: 'MONTHS' | 'YEARS' };
  onSuccess: () => void;
}

export default function PossessionModal({
  isOpen, onClose, entityId, entityType, entityName, initialStatus, initialTimeline, onSuccess
}: PossessionModalProps) {
  const [status, setStatus] = useState<ConstructionStatus>(initialStatus || 'NOT_STARTED');
  const [timeValue, setTimeValue] = useState(initialTimeline?.value || 1);
  const [timeUnit, setTimeUnit] = useState<'MONTHS' | 'YEARS'>(initialTimeline?.unit || 'MONTHS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      const session = await authClient.getSession();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
      
      const endpoint = 
        entityType === 'project' ? `/api/inventory/projects/${entityId}/possession` :
        entityType === 'tower' ? `/api/inventory/towers/${entityId}/possession` :
        `/api/inventory/units/${entityId}/possession`;

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          timeline: { value: timeValue, unit: timeUnit }
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update possession details');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Set Possession Timeline</h2>
            <p className="text-sm text-slate-500 mt-1">
              Updating for <span className="font-semibold text-indigo-600">{entityName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {entityType === 'project' || entityType === 'tower' ? (
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-200 flex gap-2 items-start">
              <Activity className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>Warning:</strong> Updating this {entityType} will cascade and aggressively overwrite all custom timelines set on {entityType === 'project' ? 'its towers and units' : 'its units'}.
              </p>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Construction Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as ConstructionStatus)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Timeline Remaining</label>
            <div className="flex gap-3">
              <input
                type="number"
                min="0"
                value={timeValue}
                onChange={(e) => setTimeValue(parseInt(e.target.value) || 0)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value as 'MONTHS' | 'YEARS')}
                className="w-32 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              >
                <option value="MONTHS">Months</option>
                <option value="YEARS">Years</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
            Save Timeline
          </button>
        </div>
      </div>
    </div>
  );
}
