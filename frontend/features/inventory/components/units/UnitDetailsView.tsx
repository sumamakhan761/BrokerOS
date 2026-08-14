import React from 'react';

interface UnitDetailsViewProps {
  unit: any;
  setPossessionModalOpen: (open: boolean) => void;
  readOnly?: boolean;
}

export function UnitDetailsView({ unit, setPossessionModalOpen, readOnly }: UnitDetailsViewProps) {
  return (
    <>
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Status</span>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border
          ${unit.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
          ${unit.status === 'RESERVED' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
          ${unit.status === 'SOLD' ? 'bg-rose-100 text-rose-700 border-rose-200' : ''}
          ${unit.status === 'BLOCKED' ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
        `}>
          {unit.status}
        </span>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Type</span>
          <span className="text-slate-900 font-medium">{unit.type.replace('_', ' ')}</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Facing</span>
          <span className="text-slate-900 font-medium">{unit.facing || 'N/A'}</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Carpet Area</span>
          <span className="text-slate-900 font-medium">{unit.carpetArea} sq.ft</span>
        </div>
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <span className="text-xs text-indigo-400 font-semibold uppercase mb-1 block">Base Price</span>
          <span className="text-indigo-900 font-bold text-lg">${Number(unit.basePrice).toLocaleString()}</span>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <span className="text-xs text-emerald-500 font-semibold uppercase mb-1 block">Brokerage / Comm</span>
          <span className="text-emerald-900 font-bold text-lg">{unit.commissionPercentage || 0}% <span className="text-sm font-medium">(${(Number(unit.basePrice) * Number(unit.commissionPercentage || 0) / 100).toLocaleString()})</span></span>
        </div>
        
        {/* Possession Info */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 col-span-2 flex justify-between items-center">
           <div>
             <span className="text-xs text-slate-400 font-semibold uppercase mb-1 block">Procession Timeline</span>
             <span className="text-slate-900 font-medium text-sm">
               {unit.constructionStatus ? `${unit.constructionStatus.replace(/_/g, ' ')} (${unit.possessionTimeline?.value || 0} ${unit.possessionTimeline?.unit || 'MONTHS'})` : 'Inherited from Tower/Project'}
             </span>
           </div>
           {!readOnly && (
             <button onClick={() => setPossessionModalOpen(true)} className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200">
               Override
             </button>
           )}
         </div>
      </div>
    </>
  );
}
