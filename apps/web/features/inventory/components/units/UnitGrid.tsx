import React from "react";
import { Box, Store, Key, Lock, CheckCircle2 } from "lucide-react";

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
    case "AVAILABLE":
      return "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400";
    case "RESERVED":
      return "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400";
    case "SOLD":
      return "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 hover:border-rose-300";
    case "BLOCKED":
      return "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
  }
};

const getUnitIcon = (type: string) => {
  if (type === "SHOP" || type === "OFFICE")
    return <Store size={14} className="opacity-70" />;
  if (type === "STUDIO") return <Box size={14} className="opacity-70" />;
  return <Key size={14} className="opacity-70" />;
};

const getStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {
    case "AVAILABLE":
      return (
        <CheckCircle2
          size={12}
          className="text-emerald-600 absolute top-2 right-2"
        />
      );
    case "RESERVED":
      return (
        <div className="w-2 h-2 rounded-full bg-amber-500 absolute top-2.5 right-2.5 shadow-2xs" />
      );
    case "SOLD":
      return (
        <Lock size={12} className="text-rose-600 absolute top-2 right-2" />
      );
    default:
      return null;
  }
};

export function UnitGrid({
  tower,
  onUnitClick,
  isInteractive = true,
}: UnitGridProps) {
  const sortedFloors = [...tower.floors].sort(
    (a, b) => b.floorNumber - a.floorNumber
  );

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-max">
        <div className="flex flex-col gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/80 shadow-2xs">
          {sortedFloors.map((floor) => (
            <div
              key={floor.id || floor.floorNumber}
              className="flex items-center gap-4"
            >
              <div className="w-24 shrink-0 text-right pr-4 border-r border-slate-200/80">
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  {floor.name}
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-muted)] tabular-nums">
                  Floor {floor.floorNumber}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 py-1">
                {floor.units.map((unit, idx) => {
                  const isCommercial =
                    unit.type === "SHOP" || unit.type === "OFFICE";
                  return (
                    <div
                      key={unit.id || unit.unitNumber || idx}
                      className="relative group"
                    >
                      <div
                        onClick={() =>
                          isInteractive &&
                          onUnitClick &&
                          onUnitClick(unit, floor)
                        }
                        className={`
                          relative flex flex-col items-center justify-center 
                          w-20 h-20 sm:w-22 sm:h-22 border transition-all duration-150 
                          ${isCommercial ? "rounded-xl border-2" : "rounded-2xl"}
                          ${
                            isInteractive
                              ? "cursor-pointer transform hover:-translate-y-0.5 shadow-2xs hover:shadow-md active:scale-[0.96] press-effect"
                              : "opacity-90"
                          }
                          ${getUnitColor(unit.status)}
                        `}
                      >
                        {getStatusIcon(unit.status)}
                        {getUnitIcon(unit.type)}
                        <span className="mt-1 font-extrabold text-xs tracking-tight tabular-nums">
                          {unit.unitNumber}
                        </span>
                        <span className="text-[9px] font-bold opacity-75 mt-0.5 uppercase tracking-wider">
                          {unit.type.replace("_", " ")}
                        </span>
                      </div>

                      {/* Tooltip */}
                      {isInteractive && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-900 text-white text-xs rounded-2xl p-3 shadow-xl z-[60] pointer-events-none animate-enter">
                          <div className="font-extrabold text-xs mb-1.5 pb-1.5 border-b border-slate-800 flex justify-between items-center">
                            <span>Unit {unit.unitNumber}</span>
                            <span
                              className={`text-[10px] font-bold ${
                                unit.status === "AVAILABLE"
                                  ? "text-emerald-400"
                                  : unit.status === "RESERVED"
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }`}
                            >
                              {unit.status}
                            </span>
                          </div>
                          <div className="flex justify-between py-0.5 text-[11px]">
                            <span className="text-slate-400">Type</span>
                            <span className="font-bold">
                              {unit.type.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex justify-between py-0.5 text-[11px]">
                            <span className="text-slate-400">Carpet</span>
                            <span className="font-bold tabular-nums">
                              {unit.carpetArea || "—"} sqft
                            </span>
                          </div>
                          <div className="flex justify-between py-0.5 text-[11px]">
                            <span className="text-slate-400">Facing</span>
                            <span className="font-bold">
                              {unit.facing || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between py-0.5 text-[11px] pt-1 mt-1 border-t border-slate-800">
                            <span className="text-slate-400">Base Price</span>
                            <span className="font-extrabold text-emerald-400 tabular-nums">
                              ₹{Number(unit.basePrice || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
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
