"use client";

import React from 'react';
import { X, Lock, Info } from 'lucide-react';

interface UnitInfoDrawerProps {
  unit: any;
  isOpen: boolean;
  onClose: () => void;
}

export function UnitInfoDrawer({ unit, isOpen, onClose }: UnitInfoDrawerProps) {
  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity pointer-events-auto"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-h-[80vh] bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col md:rounded-2xl md:max-w-md mx-auto pointer-events-auto z-10">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 md:rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Unit {unit.unitNumber}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Floor {unit.floor?.floorNumber || 'Unknown'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Status</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2
                ${unit.status === 'RESERVED' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                ${unit.status === 'SOLD' ? 'bg-rose-100 text-rose-700 border-rose-200' : ''}
                ${unit.status === 'BLOCKED' ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}
              `}>
                <Lock className="w-3.5 h-3.5" />
                {unit.status}
              </span>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Warning Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 font-medium">This unit is currently locked and cannot be booked.</p>
                <p className="text-xs text-slate-500 mt-1">If you believe this is a mistake, please contact your Sales Manager to release the unit.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white md:rounded-b-2xl">
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
