import React from 'react';
import { Box, Store, Key, Lock, CheckCircle2 } from 'lucide-react';

interface Unit {
  id?: string;
  unitNumber: string;
  type: string;
  status: string;
  basePrice?: number;
  carpetArea?: number;
  facing?: string;
  [key: string]: any;
}

interface Floor {
  id?: string;
  floorNumber: number;
  name: string;
  units: Unit[];
}

interface Tower {
  id?: string;
  name: string;
  floors: Floor[];
}

interface UnitGridProps {
  tower: Tower;
  onUnitClick?: (unit: Unit, floor: Floor) => void;
  isInteractive?: boolean;
}

const getUnitColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 hover:border-emerald-300';
    case 'RESERVED': return 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 hover:border-amber-300';
    case 'SOLD': return 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 hover:border-rose-300';
    case 'BLOCKED': return 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200';
  }
};

const getUnitIcon = (type: string) => {
  if (type === 'SHOP' || type === 'OFFICE') return <Store className="w-4 h-4 opacity-70" />;
  if (type === 'STUDIO') return <Box className="w-4 h-4 opacity-70" />;
  return <Key className="w-4 h-4 opacity-70" />;
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE': return <CheckCircle2 className="w-3 h-3 text-emerald-500 absolute top-2 right-2" />;
    case 'RESERVED': return <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-2.5 right-2.5 shadow-sm" />;
    case 'SOLD': return <Lock className="w-3 h-3 text-rose-500 absolute top-2 right-2" />;
    default: return null;
  }
};

export function UnitGrid({ tower, onUnitClick, isInteractive = true }: UnitGridProps) {
  // Sort floors descending (top floor first)
  const sortedFloors = [...tower.floors].sort((a, b) => b.floorNumber - a.floorNumber);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-max">
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {sortedFloors.map(floor => (
            <div key={floor.id || floor.floorNumber} className="flex items-center gap-4">
              <div className="w-24 shrink-0 text-right pr-4 border-r border-slate-100">
                <span className="text-sm font-semibold text-slate-700 block">{floor.name}</span>
                <span className="text-xs text-slate-400">Floor {floor.floorNumber}</span>
              </div>
              
              <div className="flex flex-wrap gap-3 py-1">
                {floor.units.map((unit, idx) => {
                  const isCommercial = unit.type === 'SHOP' || unit.type === 'OFFICE';
                  return (
                    <div key={unit.id || unit.unitNumber || idx} className="relative group">
                      <div 
                        onClick={() => isInteractive && onUnitClick && onUnitClick(unit, floor)}
                        className={`
                          relative flex flex-col items-center justify-center 
                          w-20 h-20 sm:w-24 sm:h-24 border-2 transition-all duration-200 
                          ${isCommercial ? 'rounded-md border-[3px]' : 'rounded-xl'}
                          ${isInteractive ? 'cursor-pointer transform hover:-translate-y-1 shadow-sm hover:shadow-md' : 'opacity-90'}
                          ${getUnitColor(unit.status)}
                        `}
                      >
                        {getStatusIcon(unit.status)}
                        {getUnitIcon(unit.type)}
                        <span className="mt-2 font-bold text-sm sm:text-base tracking-tight">{unit.unitNumber}</span>
                        <span className="text-[10px] sm:text-xs font-medium opacity-80 mt-0.5">
                          {unit.type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {/* Hover Tooltip */}
                      {isInteractive && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl z-[60] pointer-events-none">
                          <div className="font-bold text-sm mb-1.5 pb-1.5 border-b border-slate-700">Unit {unit.unitNumber}</div>
                          <div className="flex justify-between py-0.5"><span className="text-slate-400">Type</span> <span>{unit.type.replace('_', ' ')}</span></div>
                          <div className="flex justify-between py-0.5"><span className="text-slate-400">Area</span> <span>{unit.carpetArea} sqft</span></div>
                          <div className="flex justify-between py-0.5"><span className="text-slate-400">Facing</span> <span>{unit.facing || '-'}</span></div>
                          <div className="flex justify-between py-0.5"><span className="text-slate-400">Base Price</span> <span className="font-semibold text-emerald-400">₹{Number(unit.basePrice || 0).toLocaleString('en-IN')}</span></div>
                          <div className="mt-1.5 pt-1.5 border-t border-slate-700 flex items-center justify-between">
                            <span className="text-slate-400">Status</span>
                            <span className={`font-bold ${
                              unit.status === 'AVAILABLE' ? 'text-emerald-400' : 
                              unit.status === 'RESERVED' ? 'text-amber-400' : 
                              unit.status === 'SOLD' ? 'text-rose-400' : 'text-slate-400'
                            }`}>{unit.status}</span>
                          </div>
                          {/* Triangle indicator */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45 border-r border-b border-transparent"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
